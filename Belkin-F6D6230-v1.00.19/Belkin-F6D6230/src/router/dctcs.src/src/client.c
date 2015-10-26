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

#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <signal.h>
#include <sys/time.h>
#include <sys/stat.h>
#include <errno.h>
#include <fcntl.h>
#include <syslog.h>

#include "common.h"
#include "client.h"
#include "dctcs.h"

#define MAX_COMMANDS 7
#define MAX_CMDS_TO_STATUS 30
#define MAX_SEC_TO_WRITE_STAT 3600 * 12

static char **tnames;
static int tlength;
static struct ctorrent_t ctorrent[MAX_CLIENTS];
typedef void (client_command_t) (char*, int);
static int start = 1;
static unsigned int checkival;


static void cmd_ctorrent(char* cmd, int ci);
static void cmd_cstatus(char* cmd, int ci);
static void cmd_ctbw(char* cmd, int ci);
static void cmd_ctinfo(char* cmd, int ci);
static void cmd_ctdetail(char* cmd, int ci);
static void cmd_ctconfig(char* cmd, int ci);
static void cmd_ctfile(char* cmd, int ci);

static client_command_t* CMD[] = {cmd_ctorrent, cmd_cstatus, cmd_ctbw, cmd_ctinfo, cmd_ctdetail, cmd_ctconfig, cmd_ctfile};
static const char* const COMMANDS[] = {"CTORRENT","CTSTATUS","CTBW", "CTINFO", "CTDETAIL", "CTCONFIG", "CTFILE"};

inline int update_stat_time();

struct torrent_t torrent[MAX_TORRENTS];

struct ctorrent_t* get_clients(void) {
	return ctorrent;
}

struct torrent_t* get_torrents(void) {
	return torrent;
}

char* getDirOrFile(char* torrent, int dironly) {
	syslog(LOG_DEBUG, "getDirOrFile");
	int fds[2];
	pipe(fds);
	pid_t pid;
	if ( (pid = fork()) == 0) {
		dropconnections(-1);
		close(fds[0]);//reading
		dup2(fds[1], fileno(stdout));
		execl(cparam_p, cparam_0, "-x", torrent, NULL);
		syslog(LOG_WARNING, "can not execute ctorrent -x");
		#ifdef DEBUG
			printf("can not execute ctorrent -x");
		#endif
		exit(-1);
	}
	if (pid == -1) {
		syslog(LOG_WARNING, "can not fork to execute ctorrent -x");
		#ifdef DEBUG
			printf("can not fork to execute ctorrent -x");
		#endif
		close(fds[0]);
		close(fds[1]);
		return NULL;
	}
	close(fds[1]);
	FILE* in = fdopen(fds[0], "r");
	char *line = NULL, *sdir, *dir = NULL;
	int size = 0;
	while(getline(&line, &size, in) != -1) {
		if ((sdir = strstr(line, "Directory: ")) != 0) {
			 dir = strdup(sdir + 11);
			 char *e = strrchr(dir, '\n');
			 if (e) *e = 0;
			 e = strrchr(dir, '\r');
			 if (e) *e = 0;
			 if (dir[0] == '/') {
				 char *t = strdup(dir + 1);
				 free(dir);
				 dir = t;
			 }
		}
		if (!dironly && dir == NULL && (sdir = strstr(line, "<1> "))) {
			dir = strdup(sdir + 4);
			char* e = strrchr(dir, '[');
			*--e = 0;
		}
	}
	if (line)
		free(line);
	#ifdef DEBUG
	else
		printf("no line read in getdirorfile?!");
	#endif
	fclose(in);
	waitpid(pid, NULL, 0);
	return dir;
}

char* getDir(char* torrent) {
	getDirOrFile(torrent, 1);
}

char* getTorrentDir(int ti) {
	if (ti < MAX_TORRENTS && ti >= 0 && torrent[ti].name) {
		char *file;
		int ulen = strlen(upload_dir);
		file = malloc(ulen + strlen(torrent[ti].name) + 5);
		strcpy(file, upload_dir);
		if (file[ulen - 1] != '/')
			strcat(file, "/");
		strcat(file, torrent[ti].name);
		char* path = getDirOrFile(file, 0);
		free(file);
		return path;
	}
	return NULL;
}

void cmd_ctfile(char* cmd, int ci) {
	struct ctfile_t *file, *cfile, *pfile = &ctorrent[ci].files;
	file = calloc(sizeof(struct ctfile_t), 1);
	file->filename = calloc(500, 1);
	switch ( ctorrent[ci].protocol ){
		case 1:
			//CTFILE fileno n_pieces n_have filesize filename
			sscanf(cmd, "%*s %u %u %u %Lu %499c\n", &file->fileno, &file->n_pieces, &file->n_have, &file->filesize, file->filename);
			break;
		case 3:
			//CTFILE fileno priority current_priority n_pieces n_have n_available filesize filename
			sscanf(cmd, "%*s %u %u %*u %u %u %u %Lu %499c\n", &file->fileno, &file->priority, &file->n_pieces, &file->n_have, &file->n_available, &file->filesize, file->filename);
			break;
		#ifdef DEBUG
		default:
			printf("unknow protocol version from client: %d\n", ci);
		#endif
	}

	int len = strlen(file->filename);
	file->filename = realloc(file->filename, len + 1);
	file->filename[len - 1] = 0;
	syslog(LOG_DEBUG, "file info from client: %d, file: %s", ci, file->filename);
	for(cfile=pfile->next; cfile; cfile = cfile->next, pfile = pfile->next){
		if (cfile->fileno == file->fileno) {
			cfile->priority = file->priority;
			cfile->n_have = file->n_have;
			cfile->n_available = file->n_available;
			free(file->filename);
			free(file);
			#ifdef DEBUG
				printf("found file no: %d, updated\n", cfile->fileno);
			#endif
			break;
		}
	}
	if (!cfile) {
		pfile->next = file;
		#ifdef DEBUG
			printf("new file no: %d, added\n", file->fileno);
		#endif
	}
	ctorrent[ci].cmd_count--;
}

void delcallback(char* name) {
	remove(name);
}
void del_torrent(int ti, int deldata) {
	if (ti < MAX_TORRENTS && ti >= 0 && torrent[ti].name) {
		char *file;
		int ulen = strlen(upload_dir);
		file = malloc(ulen + strlen(torrent[ti].name) + 5);
		strcpy(file, upload_dir);
		if (file[ulen - 1] != '/')
			strcat(file, "/");
		strcat(file, torrent[ti].name);
		syslog(LOG_DEBUG, "deleting torrentfile: %s data: %d", file, deldata);
		if (deldata /*&& torrent[ti].ctorrent == -1*/) {
			char* path = getDirOrFile(file, 0);
			if (path) {
				int dlen = strlen(download_dir);
				char fname[dlen + 2 + strlen(path)];
				strcpy(fname, download_dir);
				if (fname[dlen -1] != '/')
					strcat(fname, "/");

				struct stat buf;
				strcat(fname, path);
				if (stat(fname, &buf)==0) {
					if (!S_ISDIR(buf.st_mode)) {
						unlink(fname);
					} else {
						listdir(fname, 0, 0, 1, 1, delcallback);
						remove(fname);
					}
				}
				free(path);
			}
		}
		if (/*torrent[ti].ctorrent == -1 &&*/ unlink(file)==0) {
			strcat(file, ".bf");
			unlink(file);
			if (torrent[ti].ctorrent == -1) {
				free(torrent[ti].name);
				torrent[ti].name = 0;
				torrent[ti].status = 0;
			}
		}
		free(file);
	}
}

void start_torrent(int ti) {
	if (ti < MAX_TORRENTS && ti >= 0 && torrent[ti].name && torrent[ti].ctorrent == -1) {
		char *file;
		int ulen = strlen(upload_dir);
		file = malloc(ulen + strlen(torrent[ti].name) + 2);
		strcpy(file, upload_dir);
		if (file[ulen - 1] != '/')
			strcat(file, "/");
		strcat(file, torrent[ti].name);
		start_client(file);
		free(file);
	}
}

void pause_client(int ci){
	if (ci < MAX_CLIENTS && ci >= 0 && ctorrent[ci].valid) {
		char *msg;
		//redundant check just to be sure
		unsigned short pause = ctorrent[ci].paused?0:1;
		int len;
		switch (ctorrent[ci].protocol) {
			case 1:
				len = asprintf(&msg, "CTCONFIG . . . . . . . %hd .\n", pause);
				break;
			case 3:
				len = asprintf(&msg, "CTCONFIG pause %hd\n", pause);
				break;
			#ifdef DEBUG
			default:
				printf("unknown protocol version from client: %d\n", ci);
			#endif
		}
		write(ctorrent[ci].socket, msg, len);
		free(msg);
		write(ctorrent[ci].socket, "SENDCONF\n", 9);
		syslog(LOG_DEBUG, "pausing client: %d", ci);
	}
}

void cmd_ctconfig(char* cmd, int ci) {
	switch ( ctorrent[ci].protocol ){
		case 1:
			//CTCONFIG verbose seedtime seed_ratio maxpeers minpeers fileno exitzero pause soft_quit
			sscanf(cmd, "%*s %*s %*s %*s %*s %*s %*s %*s %hd %*s\n", &ctorrent[ci].paused);
			#ifdef DEBUG
				printf("client: %d, paused: %hd\n", ci, ctorrent[ci].paused);
			#endif
			syslog(LOG_DEBUG, "client %d paused %d", ci, ctorrent[ci].paused);
			break;
		case 3:
			//CTCONFIG pause B 1 1:0 13:Pause torrent 20:Stop upload/download
			sscanf(cmd, "%*s pause B %*hd %*u:%hd %*s:%*s %*s:%*s\n", &ctorrent[ci].paused);
			//CTCONFIG file_list S 4096 1:9 19:Download files [-n] 0:
			unsigned int len, nlen;
			if (sscanf(cmd, "%*s file_list S %*d %ud:", &len) == 1) {
				struct ctfile_t *files = ctorrent[ci].files.next;
				if (!files) {
					syslog(LOG_INFO, "file_list received but ctfiles not from client %d, ignoring", ci);
					break;
				}
				char* toparse;
				if (len > 0) {
					toparse = malloc(sizeof(char) * len + 1);
					if (!toparse) {
						syslog(LOG_WARNING, "not enough memory to parse file_list");
						break;
					}
					sscanf(cmd, "%*s file_list S %*d %*d:%s ", toparse);
				} else
					toparse = strdup("*");
				if (strcmp(toparse, ctorrent[ci].dfiles ? ctorrent[ci].dfiles : "n") != 0) {
					ctorrent[ci].dfiles = strdup(toparse);
					if (strchr(toparse, '*') != NULL || strstr(toparse, "...") != NULL) {
						for(; files; files = files->next) 
							files->download = 1;
						ctorrent[ci].dsize = ctorrent[ci].size;
					} else {
						for(; files; files = files->next)
							files->download = 0;
						ctorrent[ci].dsize = 0;
						int *fnums = calloc((nlen = (len / 2 + 1)), sizeof(int));
						char *str1, *str2, *token, *subtoken;
						char *saveptr1, *saveptr2;
						int j = 0;
	
						for (str1 = toparse; ;str1 = NULL) {
							token = strtok_r(str1, ",", &saveptr1);
							if (token == NULL)
								break;
							for (str2 = token; ; str2 = NULL) {
								if (j >= nlen) {
									nlen += 10;
									fnums = realloc(fnums, nlen * sizeof(int));
								}
								subtoken = strtok_r(str2, "+", &saveptr2);
								if (subtoken == NULL)
									break;
								fnums[j++] = atoi(subtoken);
								char* r = strchr(subtoken, '-');
								if (r != NULL) {
									int end = atoi(r + 1);
									if (end - fnums[j - 1] >= nlen - j) {
										nlen = (end - fnums[j - 1]) + 10;
										fnums = realloc(fnums, nlen * sizeof(int));
									}
									int i = fnums[j - 1] + 1;
									for (;i <= end; i++,j++ )
										fnums[j] = i;
								}
							}
						}
						nlen = j;
						for(files = ctorrent[ci].files.next; files; files = files->next) {
							for (j = 0; j < nlen; j++) {
								if (files->fileno == fnums[j]) {
									files->download = 1;
									ctorrent[ci].dsize += files->filesize;
									break;
								}
							}
						}
						free(fnums);
					}
				}
				free(toparse);
				syslog(LOG_DEBUG, "file_list parsed for client %d", ci);
			}
			break;
		#ifdef DEBUG
		default:
			printf("unknow protocol version from client: %d\n", ci);
		#endif
	}
}

void refresh_client(int client) {
	if (client < MAX_CLIENTS && client >=0 && ctorrent[client].valid) {
		write(ctorrent[client].socket, "CTUPDATE\n", 9);
	}
}

void quit_client(int ci){
	if (ci < MAX_CLIENTS && ci >= 0 && ctorrent[ci].valid) {
		syslog(LOG_DEBUG, "sending quit to client: %d", ci);
		write(ctorrent[ci].socket, "CTQUIT\n", 7);
	}
}

int getAverage(int data[], int len) {
	int sum = 0, i;
	for (i=0; i < len; i++)
		sum += data[i];
	return sum / len;
}

int get_client_davg(struct ctorrent_t* ct) {
	return getAverage(ct->udrates[1], 3);
}

int get_client_uavg(struct ctorrent_t* ct) {
	return getAverage(ct->udrates[0], 3);
}

void update_client_avgs(struct ctorrent_t* ct) {
	ct->udrates[0][ct->udidx] = ct->ul_rate;
	ct->udrates[1][ct->udidx] = ct->dl_rate;
	ct->udidx = (ct->udidx + 1) % 3;
}

void set_clients_limits(struct ctorrent_t* ct, int sock) {
	double suload = 0, sdload = 0;
	int i, numclients = 0;
	for (i = 0; i < MAX_CLIENTS; i++){
		if (ctorrent[i].valid) {
			suload+=get_client_uavg(&ctorrent[i]);
			sdload+=get_client_davg(&ctorrent[i]);
			numclients++;
		}
	}
	int cul, cdl;
	suload = suload == 0 ? 1 : suload;
	sdload = sdload == 0 ? 1 : sdload;
	cul = (int)((get_client_uavg(ct)/suload) * ulimit * 1024);
	cdl = (int)((get_client_davg(ct)/sdload) * dlimit * 1024);
	cul = cul == 0 && ulimit != 0 ? ulimit * 1024 / numclients : cul; 
	cdl = cdl == 0 && ulimit != 0 ? ulimit * 1024 / numclients : cdl;
	char * msg;
	int len = asprintf(&msg, "SETDLIMIT %d\n", cdl);
	write(sock, msg, len);
	free(msg);
	len = asprintf(&msg, "SETULIMIT %d\n", cul);
	write(sock, msg, len);
	free(msg);
	#ifdef DEBUG
		printf("setulimit %s: %d\n", ct->fname, cul);
	#endif
	syslog(LOG_DEBUG, "setting ulimt for %s to %d", ct->fname, cul);
}

int get_dlimit(void) {
	return dlimit;
}

int get_ulimit(void) {
	return ulimit;
}

void set_limits(int ul, int dl) {
	ulimit = ul;
	dlimit = dl;
	int i;
	for (i = 0; i < MAX_CLIENTS; i++){
		if (ctorrent[i].valid) {
			ctorrent[i].cmd_count = MAX_CMDS_TO_STATUS + 1;
		}
	}
}

void update_client(int ci) {
	write(ctorrent[ci].socket, "SENDSTATUS\n", 11);
	write(ctorrent[ci].socket, "SENDDETAIL\n", 11);
}

void cmd_ctdetail(char* cmd, int ci) {
	unsigned long long currtime, seedtime;
	//CTDETAIL torrent_size piece_size current_timestamp seed_timestamp
	sscanf(cmd, "%*s %Lu %u %Lu %Lu", &ctorrent[ci].size, &ctorrent[ci].piece_size, &currtime, &seedtime);
	ctorrent[ci].seed_time = seedtime ? currtime - seedtime : 0;
	ctorrent[ci].total_time = currtime - ctorrent[ci].start_time;
	#ifdef DEBUG
		printf("client: %d, size: %llu, seed-time:%llu\n", ci, ctorrent[ci].size, ctorrent[ci].seed_time);
	#endif
}

void cmd_ctinfo(char* cmd, int ci) {
	int len = strlen(cmd), i = 6;

	if (ctorrent[ci].msg)
	{
		free(ctorrent[ci].msg);
		ctorrent[ci].msg = NULL;
		ctorrent[ci].severity = -1;
	}
	if ('0' <= cmd[7] && cmd[7] <= '9') {
		ctorrent[ci].severity = cmd[7] - '0';
		i = 9;
	} else
		ctorrent[ci].severity = 0;
	ctorrent[ci].msg = malloc(len - i + 1);
	strncpy(ctorrent[ci].msg, &cmd[i], len - i);
	ctorrent[ci].msg[len - i] = 0;
	char* c;
	while( (c = strchr(ctorrent[ci].msg,'\t')) != NULL) {
		*c = ' ';
	}
	while( (c = strchr(ctorrent[ci].msg,'\n')) != NULL) {
		*c = ' ';
	}
	#ifdef DEBUG
		printf("info: %d, %s\n", ctorrent[ci].severity, ctorrent[ci].msg);
	#endif
	syslog(LOG_DEBUG, "ctinfo from client: %d,%s", ci, ctorrent[ci].msg);
}

void cmd_ctorrent(char* cmd, int ci) {
	unsigned long long currtime;
	char fname[500];
	bzero(fname, 500);
	sscanf(cmd, "%*s %*s %Lu %Lu %499c\n", &ctorrent[ci].start_time, &currtime, fname);
	int len = strlen(fname);
	fname[len - 1] = 0;
	ctorrent[ci].fname = malloc(len);
	strcpy(ctorrent[ci].fname, fname);
	ctorrent[ci].total_time = currtime - ctorrent[ci].start_time;
	#ifdef DEBUG
		printf("client %u, started: %llu, fname: %s\n", ci, ctorrent[ci].start_time, ctorrent[ci].fname);
	#endif
	syslog(LOG_DEBUG, "client started: %d", ci);
	ctorrent[ci].files.filename = getDir(ctorrent[ci].fname);
	char* tname = strstr(fname, upload_dir);
	tname = tname ? tname + strlen(upload_dir) : fname;
	if (tname[0] == '/') tname++;
	for (len = 0; len < MAX_TORRENTS; len++) {
		if (torrent[len].name && strcmp(tname, torrent[len].name) == 0) {
			torrent[len].ctorrent = ci;
			if (torrent[len].status == 2)
				pause_client(ci);
			torrent[len].status = 1;
			#ifdef DEBUG
				printf("torrent file already existed\n");
			#endif
			if (torrent[len].dfiles) {
				char* msg;
				int mlen = asprintf(&msg, "CTCONFIG file_list %s\n", torrent[len].dfiles);
				write(ctorrent[ci].socket, msg, mlen);
				free(msg);
				write(ctorrent[ci].socket, "SENDCONF\n", 9);
				#ifdef DEBUG
					printf("sent file list to ctorrent\n");
				#endif
				syslog(LOG_DEBUG, "sent file list to ctorrent: %s", torrent[len].dfiles);
				free(torrent[len].dfiles);
				torrent[len].dfiles = NULL;
			}
			return;
		}
	}
	for (len = 0; len < MAX_TORRENTS; len++) {
		if (!torrent[len].name) {
			torrent[len].ctorrent = ci;
			torrent[len].status = 1;
			torrent[len].name = strdup(tname);
			#ifdef DEBUG
				printf("new torrent file added\n");
			#endif
			break;
		}
	}
}

void cmd_cstatus(char* cmd, int ci) {
	struct ctorrent_t *ct = &ctorrent[ci];
	unsigned long long dprev = ct->dl_total, uprev = ct->ul_total;
	switch ( ctorrent[ci].protocol ){
		case 1:
			sscanf(cmd, "%*s %u/%u %u/%u/%u %u,%u %Lu,%Lu %u,%u", &ct->seeders, &ct->leechers,
			       &ct->n_have, &ct->n_total, &ct->n_avail, &ct->dl_rate, &ct->ul_rate,
	  			&ct->dl_total, &ct->ul_total, &ct->dl_limit, &ct->ul_limit);
			break;
		case 2:
		case 3:
			//CTSTATUS seeders:total_seeders/leechers:total_leechers/connecting n_have/n_total/n_avail dl_rate,ul_rate dl_total,ul_total dl_limit,ul_limit cache_used
			sscanf(cmd, "%*s %u:%*u/%u:%*u/%*u %u/%u/%u %u,%u %Lu,%Lu %u,%u %*u", &ct->seeders, &ct->leechers,
			       &ct->n_have, &ct->n_total, &ct->n_avail, &ct->dl_rate, &ct->ul_rate,
	  			&ct->dl_total, &ct->ul_total, &ct->dl_limit, &ct->ul_limit);
			break;
		#ifdef DEBUG
		default:
			printf("unknow protocol version from client: %d\n", ci);
		#endif
	}
	update_client_avgs(ct);
	stats.down += (ct->dl_total - dprev);
	stats.up += (ct->ul_total - uprev);
	#ifdef DEBUG
		printf("seeders: %u/leechers:%llu ul_total: %llu, ul_limit: %u\n", ctorrent[ci].seeders, ctorrent[ci].leechers, ctorrent[ci].ul_total, ctorrent[ci].ul_limit);
	#endif
}

void cmd_ctbw(char* cmd, int ci) {
	struct ctorrent_t *ct = &ctorrent[ci];

	if (ct->msg)
	{
		free(ct->msg);
		ct->msg = NULL;
		ct->severity = -1;
	}

	sscanf(cmd, "%*s %u,%u %u,%u", &ct->dl_rate, &ct->ul_rate, &ct->dl_limit, &ct-> ul_limit);
	update_client_avgs(ct);
	#ifdef DEBUG
		printf("ul-rate: %u, ul limit: %u\n", ctorrent[ci].ul_rate, ctorrent[ci].ul_limit);
	#endif
}

int handle_client(int ci, int sock) {

	char ccommand[1000];
	int r = readline(sock, ccommand, 1000);
	if ( r  == 0 || r == -1) {
		if (ctorrent[ci].fname) {
			free(ctorrent[ci].fname);
			ctorrent[ci].fname=NULL;
		}
		if (ctorrent[ci].msg) {
			free(ctorrent[ci].msg);
			ctorrent[ci].msg=NULL;
		}
		ctorrent[ci].valid = 0;
		struct ctfile_t *f, *p = &ctorrent[ci].files;
		for( f = p->next; f ; f = p){
			 p = f->next;
			 free(f->filename);
			 free(f);
		}
		ctorrent[ci].files.next = 0;
		for( r = 0; r < MAX_TORRENTS; r++ ){
			if (torrent[r].ctorrent == ci) {
				torrent[r].status = 0;
				torrent[r].ctorrent = -1;
				torrent[r].n_total = ctorrent[ci].n_total;
				torrent[r].n_have = ctorrent[ci].n_have;
				torrent[r].piece_size = ctorrent[ci].piece_size;
				int ulen = strlen(upload_dir);
				char* file = malloc(ulen + strlen(torrent[r].name) + 2);
				strcpy(file, upload_dir);
				if (file[ulen - 1] != '/')
					strcat(file, "/");
				strcat(file, torrent[r].name);
				int err = access(file, F_OK);
				if (err == -1 && errno == ENOENT) {
					free(torrent[r].name);
					torrent[r].name = 0;
					if (ctorrent[ci].dfiles != NULL) free(ctorrent[ci].dfiles);
					if (torrent[r].dfiles != NULL) free(torrent[r].dfiles);
				} else if (ctorrent[ci].dfiles != NULL) {
						torrent[r].dfiles = strdup(ctorrent[ci].dfiles);
						free(ctorrent[ci].dfiles);
					}
				free(file);
				break;
			}
		}
		return -1;
	}
	#ifdef DEBUG
		printf("client: %d: %s\n", ci, ccommand);
	#endif
	syslog(LOG_DEBUG, "command from client %d:%s", ci, ccommand);
	char command[11];
	command[0] = 0;
	sscanf(ccommand, "%10s", &command);

	for (r = 0; r < MAX_COMMANDS; r++)
		if (strcmp(command, COMMANDS[r]) == 0) {
			CMD[r](ccommand, ci);
			ctorrent[ci].cmd_count++;
			if (ctorrent[ci].cmd_count >= MAX_CMDS_TO_STATUS) {
				update_client(ci);
				set_clients_limits(&ctorrent[ci], sock);
				ctorrent[ci].cmd_count = 0;
			}
			break;
		}
	if (update_stat_time() > MAX_SEC_TO_WRITE_STAT) {
		write_stats();
	}
	return 0;
}

int init_client(int client, int socket) {
	char buff[15];
	int protocol;
	int r = readline(socket, buff, 15);
	if ( r  == 0 || r == -1) {
		return -1;
	} else {
		if (sscanf(buff, "PROTOCOL %d\n", &protocol) != 1) {
			send(socket, "ERROR\n", sizeof("ERROR\n"), 0);
			return -1;
		} else {
			#ifdef DEBUG
				printf("\n got protocol version: %d\n", protocol);
			#endif
			if (protocol > 3) {
				protocol = 3;
			} else if (protocol == 2) {
				protocol = 1;
			}
			char* msg;
			r = asprintf(&msg, "PROTOCOL 000%d\n", protocol);
			send(socket, msg, r, 0);
			send(socket, "SENDDETAIL\n", 11, 0);
			send(socket, "SENDCONF\n", 9, 0);
			free(msg);
			bzero(&ctorrent[client], sizeof(struct ctorrent_t));
			ctorrent[client].severity = -1;
			ctorrent[client].valid = 1;
			ctorrent[client].socket = socket;
			ctorrent[client].protocol = protocol;
			syslog(LOG_DEBUG, "new client connected %d, protocol: %d", client, protocol);
		}
	}
	return 0;
}

static void list_torrents(void) {
	if (!tnames) {
		tnames = malloc(sizeof(char*)*MAX_CLIENTS);
		bzero(tnames, sizeof(char*)*MAX_CLIENTS);
		tlength = listdir(upload_dir, tnames, MAX_CLIENTS, 1, 0, 0);
	}
}

void alarmhandler(int sig) {
	if (!start) {
		list_torrents();
	}
	int i, j;
	#ifdef DEBUG
		printf("restarting remaining torrents\n");
	#endif
	syslog(LOG_DEBUG, "restarting torrents");
	for( ;tlength > 0 ;tlength-- ){
		j=0;
		if (start) {
			for (i = 0; i < MAX_CLIENTS && j == 0; i++)
				j = (ctorrent[i].valid && ctorrent[i].fname && strcmp(ctorrent[i].fname, tnames[tlength - 1]) == 0);
		} else {
			char *dot = strrchr(tnames[tlength - 1], '.');
			if (dot == NULL || strcmp(dot, ".bf") != 0) {
				for( i = 0; i < MAX_TORRENTS && j == 0; i++) {
					char *p = strstr(tnames[tlength-1], upload_dir);
					if (p) {
						p+=strlen(upload_dir);
						if (*p == '/')
							p++;
					}
					j = (torrent[i].name && strcmp(torrent[i].name, p ? p : tnames[tlength - 1]) == 0);
				}
			} else 
				j = 1;
		}
		if (!j) {
			if (!start) {
				add_torrent(tnames[tlength-1], 0);
			}
			start_client(tnames[tlength - 1]);
		}
		free(tnames[tlength - 1]);
	}
	start = 0;
	free(tnames);
	tnames = NULL;
	if (checkival)
		restart_torrents();
}

void restart_torrents(void) {
	struct sigaction sg;
	bzero(&sg, sizeof(struct sigaction));
	sg.sa_handler=alarmhandler;
	sigaction(SIGALRM, &sg, NULL);
	if (start) {
		list_torrents();
		if (tlength < 1) {
			free(tnames);
			tnames = NULL;
		}
	}
	if (start && tnames) {
		if (alarm(30)!=0) {
			#ifdef DEBUG
				perror("alarm");
			#endif
			syslog(LOG_ERR, "can not set alarm to restart torrents");
		}
	}
	else {
		#ifdef DEBUG
			printf("setting alarm to check torrent-directory after: %d sec\n", checkival);
		#endif
		syslog(LOG_DEBUG, "setting alarm to check torrent-directory after: %d sec", checkival);
		alarm(checkival);
	}
}

void set_checkival(unsigned int checkval) {
	checkival = checkval * 60;
	if (!start)
		restart_torrents();
}

//does not check wheter this file already listed
void add_torrent(const char * const torrentfile, int start_paused) {
	syslog(LOG_DEBUG, "adding new torrent file");
	stats.sumtorrents++;
	write_stats();
	int i;
	for(i = 0 ; i < MAX_TORRENTS; i++)
		if (!torrent[i].name){
			char *fname;
			int ulen = strlen(upload_dir);
			fname = strstr(torrentfile, upload_dir);
			if (fname) {
				fname = fname + ulen;
				if (fname[0] == '/')
					fname++;
			}
			else
				fname = torrentfile;
			torrent[i].name = strdup(fname);
			torrent[i].ctorrent = -1;
			torrent[i].status = 0 + (start_paused != 0) * 2;
			torrent[i].dfiles = NULL;
			break;
		}
}

void start_client(char const * const torrentfile) {
	int cmpargnum = completeargs ? 2 : 0;

	#ifdef DEBUG
		printf("starting ctorrent for:%s\n", torrentfile);
	#endif
	syslog(LOG_DEBUG, "starting torrent");

	if (fork() == 0) {
		dropconnections(-1);
		daemon(0,0);
		chdir(download_dir);
		//execl(cparam_p, cparam_0, "-S", client_host, "-e", cparam_e, "-E", cparam_E, "-C", cparam_C, torrentfile, NULL);
		int size = userargs_len + 11 + cmpargnum;//terminating NULL if userargs_len is 0
		char *params[size];
		params[0] = cparam_0;params[1] = "-S";params[2] = client_host; params[3] = "-e";params[4]=cparam_e;
		params[5] = "-E";params[6]= cparam_E;params[7]= "-C";params[8]=cparam_C;params[9]=torrentfile;

		if (completeargs) {
			params[10] = "-X";
			params[11] = completeargs;
		}

		if (userargs_len)
			memcpy(&params[10 + cmpargnum], userargs, userargs_len*sizeof(char*));
		else
			params[10 + cmpargnum] = NULL;
		execv(cparam_p, params);
		#ifdef DEBUG
			perror("execv");
		#endif
		syslog(LOG_WARNING, "error executing ctorrent");
		exit(-1);
	}
}

void read_torrents(void) {
	char **tnames = malloc(sizeof(char*)*MAX_TORRENTS);
	bzero(tnames, sizeof(char*)*MAX_TORRENTS);
	int tlength = listdir(upload_dir, tnames, MAX_TORRENTS, 0, 0, 0);
	int i;
	for(i = 0 ; tlength > 0; tlength--,i++){
		char *dot = strrchr(tnames[tlength - 1], '.');
		if (dot == NULL || strcmp(dot, ".bf") != 0) {
			torrent[i].name = tnames[tlength - 1];
			torrent[i].ctorrent = -1;
		}
	}
	free(tnames);
}

int create_statfile(void) {
	int fd;
	if ( (fd = open(statfile, O_CREAT|O_WRONLY|O_TRUNC, S_IRUSR)) != -1 ) {
		int res = write(fd, &stats, sizeof(struct stats_t));
		close(fd);
		return res > 0 ? 0 : -1;
		#ifdef DEBUG
			printf("stat file created\n");
		#endif
		syslog(LOG_DEBUG, "stat file created");
	} else {
		syslog(LOG_WARNING, "can not create stat file");
		#ifdef DEBUG
			perror("can not create stat file\n");
		#endif
	}
}

void init_stats(void) {
	int fd;
	bzero(&stats, sizeof(struct stats_t));
	if ( (fd = open(statfile, O_RDONLY)) == -1 ) {
		create_statfile();
	} else {
		read(fd, &stats, sizeof(struct stats_t));
		close(fd);
		#ifdef DEBUG
			printf("stat file read\n");
		#endif
		syslog(LOG_DEBUG, "stat file read");
	}
}

inline int update_stat_time(void) {
	time_t tmptime = time(NULL);
	stats.totaltime+=(tmptime - starttime);
	starttime = tmptime;
	return tmptime - last_write_time;
}

int write_stats(void) {
	int fd;
	update_stat_time();
	last_write_time = starttime;
	if (!writestats)
		return 0;
	if ( (fd = open(statfile, O_WRONLY)) == -1 ) {
		return create_statfile();
	}
	int res = write(fd, &stats, sizeof(struct stats_t));
	close(fd);
	syslog(LOG_DEBUG, "stat file wrote, ret: %d", res);
	return res > 0 ? 0 : -1;
}

void init_clients(int restart) {
	bzero(torrent, sizeof(struct torrent_t)*MAX_TORRENTS);
	read_torrents();
	if (restart) {
		restart_torrents();
	}
	init_stats();
	start = restart;
}

void update_status(void) {
	int i;
	for (i = 0; i < MAX_CLIENTS; i++) {
		if (ctorrent[i].valid)
			update_client(i);
	}
	if (update_stat_time() > MAX_SEC_TO_WRITE_STAT) {
		write_stats();
	}
}
