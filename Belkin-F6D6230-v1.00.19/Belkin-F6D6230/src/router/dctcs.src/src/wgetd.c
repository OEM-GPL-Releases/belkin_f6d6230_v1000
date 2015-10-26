/***************************************************************************
 *   Copyright (C) 2007 by Gábor Bognár   *
 *   bognarg+dctcs@gmail.com   *
 *                                                                         *
 *   This program is free software; you can redistribute it and/or modify  *
 *   it under the terms of the GNU General Public License as published by  *
 *   the Free Software Foundation; either version 2 of the License, or     *
 *   (at your option) any later version.                                   *
 *                                                                         *
 *   This program is distributed in the hope that it will be useful,       *
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of        *
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the         *
 *   GNU General Public License for more details.                          *
 *                                                                         *
 *   You should have received a copy of the GNU General Public License     *
 *   along with this program; if not, write to the                         *
 *   Free Software Foundation, Inc.,                                       *
 *   59 Temple Place - Suite 330, Boston, MA  02111-1307, USA.             *
 ***************************************************************************/
#ifdef HAVE_CONFIG_H
#include <config.h>
#endif

#include <sched.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <syslog.h>
#include <sys/wait.h>

#include "common.h"
#include "wgetd.h"

static struct wget_t wget[MAX_WDOWNLOADS];

struct wget_t* get_wgets() {
	return wget;
}
static int startwget(const char* url, int num);

unsigned long long stoull(char* num, int maxlen) {
	char s[maxlen];
	bzero(s, maxlen);
	char *p = num, *q = s;
	int i;
	for (i=0; *p && i < maxlen; p++, i++) {
		if (*p == '-' || *p == '+' || (*p >= '0' && *p <= '9') )
			*q++=*p;
	}
	return strtoull(s, NULL, 10);
}
static int dthread(void *arg) {
	struct wget_t *this =  arg;
	
	sigset_t sigset;
	sigemptyset(&sigset);
	sigaddset(&sigset, SIGPIPE);
	sigaddset(&sigset, SIGUSR1);
	sigaddset(&sigset, SIGUSR2);
	sigprocmask(SIG_SETMASK, &sigset, NULL);
	
	int fds[2];
	pipe(fds);
	pid_t pid;
	if ( (pid = fork()) == 0) {
		dropconnections(-1);
		close(fds[0]);//reading
		dup2(fds[1], fileno(stderr));
		const char *const env[2] = {"LANG=C", NULL};
		chdir(download_dir);
		
		int size = wgetargs_len + 4;//terminating NULL if wgetargs_len is 0
		char *params[size];
		params[0] = wget_c;params[1] = "--progress=bar:force";params[2]=this->url;
		if (wgetargs_len)
			memcpy(&params[3], wgetargs, wgetargs_len*sizeof(char*));
		else
			params[3] = NULL;
		execve(wget_p, params, env);
		syslog(LOG_WARNING, "can not execute wget to download: %s", this->url);
		#ifdef DEBUG
			printf("can not execute wget to download: %s\n", this->url);
		#endif
		free(this->url);
		this->used = 0;
		exit(-1);
	}
	if (pid == -1) {
		syslog(LOG_ERR, "can not fork to execute wget");
		#ifdef DEBUG
			printf("can not fork to execute wget\n");
		#endif
		close(fds[0]);
		close(fds[1]);
		free(this->url);
		this->used = 0;
		return -1;
	}
	this->pid = pid;
	close(fds[1]);
	FILE* in = fdopen(fds[0], "r");
	char *line = NULL, length[25];
	int lsize = 0, idx;
	int state = 1;
	struct wgetfile_t *currfile = this->files;
	struct wgetfile_t *prev = currfile;
	if (!currfile) {
		currfile = this->files = calloc(1, sizeof(struct wgetfile_t));
	} else {
		/*while ( currfile = currfile->next )
			prev = currfile;
		prev->next = currfile = calloc(1, sizeof(struct wgetfile_t));*/
		while (prev) {
			currfile = currfile->next;
			if (prev->filename)
				free(prev->filename);
			free(prev);
			prev = currfile;
		}
		currfile = this->files = calloc(1, sizeof(struct wgetfile_t));
	}
	this->size = this->downloaded = 0;
	prev = NULL;
	while(state) {
		switch (state) {
			case 1: 
			case 2:{
					if (getline(&line, &lsize, in) <= 0) {
						state = 0;
						break;
					}
					#ifdef DEBUG
						printf("line(1,2) = %s", line);
					#endif
					char *fstart = strstr(line, "=> `");
					if (fstart) {
						fstart+=4;
						char *fend = strrchr(line, '\'');
						*fend = 0;
						if (currfile->filename)
							free(currfile->filename);
						currfile->filename = malloc(fend - fstart + 2);
						strcpy(currfile->filename, fstart);
						#ifdef DEBUG
							printf("filename='%s'\n", currfile->filename);
						#endif
						state = 2;
						break;
					}
					if (sscanf(line, "Length: %s", length) == 1) {
						this->size += currfile->filesize = stoull(length, 25);
						#ifdef DEBUG
							printf("'%s' size = %llu\n", length, currfile->filesize);
						#endif
						getline(&line, &lsize, in);
						state = 3;
						idx = 0;
					}
					break;
				}
			case 3: {
					char c;
					unsigned long long dsize, pdsize;
					float drate;
					char buff[20], dspeed[20];
					dsize = pdsize = 0;
					if (lsize < 100) {
						line = realloc(line, lsize = 100);
					}
					//while ( (c = fgetc(in)) == '\n' ) printf("c=%c\n", c);
					//ungetc(c, in);
					while ( (c = fgetc(in)) != EOF && state == 3) {
						switch (c) {
							case '\n':
								state = 4;
							case '\r':
								line[idx] = 0;
								if (sscanf(line, "%*[^]] ] %s %f%c", buff, &drate, &c) != 3) {
									idx = 0;
									continue;
								}
								#ifdef DEBUG
									printf("line = %s, buff = %s, drate = %f, c = %c\n", line, buff, drate, c);
								#endif
								dsize = stoull(buff, 20);
								this->downloaded += dsize - pdsize;
								currfile->downloaded += dsize - pdsize;
								if (c == 'M')
									drate *= 1024;
								else if (c == 'B')
									drate /= 1024;
								this->drate = (unsigned int)drate;
								#ifdef DEBUG
									printf("downsize = %llu\nfdown = %llu", this->downloaded, currfile->downloaded);
								#endif
								pdsize = dsize;
								idx = 0;
								break;
							default:
								line[idx++] = c;
						}
					}
					if (state == 3)
						state = 0;
				}
				break;
			case 4:
				state = 0;
				printf("state4\n");
				while (getline(&line, &lsize, in) > 0) {
					printf("line(4) = %s", line);
					if (strstr(line, "saved")) {
						prev = currfile;
						currfile = currfile->next = calloc(1, sizeof(struct wgetfile_t));
						state = 1;
						break;
					}
				}
				break;
		}
	}
	if (line)
		free(line);
	if (prev) {
		prev->next = NULL;
		free(currfile);
	}
	#ifdef DEBUG
		for(currfile=this->files; currfile; currfile = currfile->next) {
			printf("%s %llu/%llu\n", currfile->filename, currfile->downloaded, currfile->filesize);
		}
		printf("sum: %llu/%llu\n", this->downloaded, this->size);
	#endif
	this->pid = 0;
	this->drate = 0;
	fclose(in);
	return 0;
}

int del_wget(int widx) {
	if (widx < MAX_WDOWNLOADS && widx >= 0 && wget[widx].used) {
		stop_wget(widx);
		
		char *file;
		syslog(LOG_DEBUG, "deleting files downloaded from: %s by wget", wget[widx].url);
		
		int dlen = strlen(download_dir);
		struct wgetfile_t *cf = wget[widx].files;
		for (; cf; cf = cf->next) {
			char fname[dlen + 1 + strlen(cf->filename) + 1];
			strcpy(fname, download_dir);
			if (fname[dlen -1] != '/')
				strcat(fname, "/");
			strcat(fname, cf->filename);
			remove(fname);
			char *c = strrchr(fname, '/');
			if (c) {
				*c=0;
				if (strncmp(download_dir, fname, dlen < (c - fname) ? dlen : c - fname))
					remove(fname);
			}
		}
		//try to avoid conflict with running wget
		struct wgetfile_t *pf = wget[widx].files;
		while (pf) {
			cf=pf->next;
			free(pf);
			pf = cf;
		}
		free(wget[widx].url);
		wget[widx].used = 0;
		wget[widx].files = NULL;
		return 1;
	}
	return 0;
}

static int startwget(const char* url, int num) {
	#define stacksize 16384
	int f = -1, i;
	for (i = 0; i < MAX_WDOWNLOADS; i++) {
		if (!wget[i].used) {
			f = i;
			if (wget[i].stack) {
				free(wget[i].stack);
				wget[i].stack = NULL;
			}
		}
	}
	if (num)
		f = num;
	if (f == -1)
		return 0;
	if (!num) {
		wget[f].stack = valloc(stacksize);
		wget[f].downloaded = 0;
		wget[f].size = 0;
		//long ps = sysconf(_SC_PAGESIZE);
		/*not in openwrt int err = posix_memalign(&stack, ps, stacksize);*/
		if ( !wget[f].stack) {
			#ifdef DEBUG
				perror("memalign");
			#endif
			syslog(LOG_ERR, "can not start wget not enough memory");
			return 0;
		}
		wget[f].url = strdup(url);
		wget[f].used = 1;
	}
	int err = clone(dthread, wget[f].stack + stacksize, SIGCHLD | CLONE_FS | CLONE_FILES | CLONE_SIGHAND | CLONE_PTRACE | CLONE_VM /*not in kamikaze?!| CLONE_PARENT*/, (void*)&wget[f]);
	if (err == -1) {
		#ifdef DEBUG
			perror("startwget");
		#endif
		syslog(LOG_ERR, "can not start wget clone error: %d", err);
		if (!num) {
			wget[f].used = 0;
			free(wget[f].url);
			free(wget[f].stack);
			wget[f].stack = NULL;
		}
	}
	return err == -1 ? 0 : 1;
}

int restart_wget(int num) {
	if (num >= MAX_WDOWNLOADS || num < 0 || !wget[num].used)
		return 0;
	if (!wget[num].pid) {
		return startwget(NULL, num);
	}
	return 1;
}

int stop_wget(int num) {
	if (num >= MAX_WDOWNLOADS || num < 0 || !wget[num].used)
		return 0;
	if (wget[num].pid) {
		kill(wget[num].pid, SIGTERM);
		wget[num].pid = 0;
	}
	return 1;
}

int start_wget(const char* url){
	return startwget(url, 0);
}
