/***************************************************************************
 *   Copyright (C) 2007 by Gábor Bognár   *
 *   bognarg+dctcs@gmail.com    *
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
#include <stdio.h>
#include <fcntl.h>
#include <sys/socket.h>
#include <stdlib.h>
#include <unistd.h>
#include <sys/stat.h>
#include <sys/wait.h>
#include <syslog.h>
#include <sys/types.h>
#include <netdb.h>
#include <errno.h>

#include "wgetd.h"
#include "common.h"
#include "wgui.h"
#include "client.h"
#include "dctcs.h"
#include "MD5.h"


#define MAX_COMMANDS 23

static const char* const http_error_notfound = "HTTP/1.0 404\n\n\n";
static const char* const http_200 = "HTTP/1.0 200 OK\n";
static const char* const http_text = "Content-Type: text/plain\n\n";
static const char* const http_html = "Content-Type: text/html\n\n";
static const char* const http_403 = "HTTP/1.0 403 FORBIDDEN\n";
static const char* const http_bad_req = "HTTP/1.0 400 Bad Request\n\n\n";

typedef int (gui_command_t) (char*, int);

static int cmd_get(char* request, int sock);
static int cmd_getclientsinfo(char* request, int sock);
static int cmd_upload(char* request, int sock);
static int cmd_auth(char* request, int sock);
static int cmd_setlimits(char* request, int sock);
static int cmd_getlimits(char* request, int sock);
static int cmd_quit(char* request, int sock);
static int cmd_update(char* request, int sock);
static int cmd_pause(char* request, int sock);
static int cmd_gettorrents(char* request, int sock);
static int cmd_deltorrent(char* request, int sock);
static int cmd_starttorrent(char* request, int sock);
static int cmd_getdetails(char* request, int sock);
static int cmd_suburl(char* request, int sock);
static int cmd_getstats(char* request, int sock);
static int cmd_setfilestodownload(char* requeset, int sock);
static int cmd_gettorrentdetails(char* request, int sock);
static int cmd_wgetd(char* request, int sock);
static int cmd_getwgets(char* request, int sock);
static int cmd_stopwget(char* request, int sock);
static int cmd_startwget(char* request, int sock);
static int cmd_wgetdetails(char* request, int sock);
static int cmd_delwget(char* request, int sock);

static gui_command_t* GCMD[] = {cmd_get, cmd_getclientsinfo, cmd_upload, cmd_auth, cmd_setlimits, cmd_getlimits, cmd_quit, cmd_update, cmd_pause, cmd_gettorrents, cmd_starttorrent, cmd_deltorrent, cmd_getdetails, cmd_suburl, cmd_getstats, cmd_setfilestodownload, cmd_gettorrentdetails, cmd_wgetd, cmd_getwgets, cmd_stopwget, cmd_startwget, cmd_wgetdetails, cmd_delwget };
static const char* const GCOMMANDS[] = {"GET","GETCLIENTSINFO","POST", "AUTH", "SETLIMITS", "GETLIMITS", "CLIENTQUIT", "CLIENTUPDATE", "CLIENTPAUSE", "GETTORRENTS", "TORRENTSTART", "TORRENTDELETE", "GETDETAILS", "SUBMITURL", "GETSTATS", "SETFILES", "GETTDETAILS", "SUBMITWDOWNLOAD", "GETWGETS", "STOPWGET", "STARTWGET", "GETWDETAILS", "WGETDELETE"};

int check_auth(char cookie[33], int sock);

static struct auth_t {
	//unsigned short status;
	long expire;
	char* cookie;
} auth;

static int cmd_delwget(char* request, int sock) {
	char auth[33];
	int wget;
	sscanf(request, "%*s /%32s/%d", auth, &wget);
	if (!check_auth(auth, sock)) {
		return 0;
	}
	syslog(LOG_DEBUG, "deleting wget num: %d", wget);
	if (del_wget(wget)) {
		write(sock, http_200, strlen(http_200));
		write(sock, "\n\n",2);
	} else
		write(sock, http_bad_req, strlen(http_bad_req));
	return 0;
}

int cmd_wgetdetails(char *request, int sock) {
	char ac[33];
	int num;
	sscanf(request, "GETWDETAILS /%32s/%d", ac, &num);
	if (!check_auth(ac, sock))
		return 0;
	struct wget_t* wds = get_wgets();
	if (num > MAX_WDOWNLOADS || num < 0 || !wds[num].used ) {
		write(sock, http_bad_req, strlen(http_bad_req));
		return 0;
	}
	write(sock, http_200, strlen(http_200));
	write(sock, http_text, strlen(http_text));
	char *msg;
	int len = asprintf(&msg, "%s\n", detailpre ? detailpre : "");
	write(sock, msg, len);
	free(msg);
	struct wgetfile_t *p = wds[num].files;
	for(; p; p=p->next) {
		len = asprintf(&msg, "%s\t%llu\t%llu\t\n", p->filename, p->downloaded, p->filesize);
		write(sock, msg, len);
		#ifdef DEBUG
			printf("%s", msg);
		#endif
		free(msg);
	}
	write(sock, "\n\n", 2);
	return 0;
}

int cmd_startwget(char *request, int sock) {
	char ac[33];
	int num;
	sscanf(request, "STARTWGET /%32s/%d", ac, &num);
	if (!check_auth(ac, sock))
		return 0;
	if (restart_wget(num)) {
		write(sock, http_200, strlen(http_200));
	} else {
		write(sock, http_bad_req, strlen(http_bad_req)-2);
	}
	write(sock, "\n\n", 2);
	return 0;
}

int cmd_stopwget(char *request, int sock) {
	char ac[33];
	int num;
	sscanf(request, "STOPWGET /%32s/%d", ac, &num);
	if (!check_auth(ac, sock))
		return 0;
	if (stop_wget(num)) {
		write(sock, http_200, strlen(http_200));
	} else {
		write(sock, http_bad_req, strlen(http_bad_req)-2);
	}
	write(sock, "\n\n", 2);
	return 0;
}

int cmd_getwgets(char *request, int sock) {
	char ac[33];
	sscanf(request, "GETWGETS /%32s", ac);
	if (!check_auth(ac, sock))
		return 0;
	struct wget_t* wds = get_wgets();
	int i;
	write(sock, http_200, strlen(http_200));
	write(sock, http_text, strlen(http_text));
	for(i = 0; i < MAX_WDOWNLOADS; i++) {
		if (wds[i].used) {
			char *msg;
			int len = asprintf(&msg, "%d\t%d\t%s\t%llu\t%llu\t%u\t\n",i, wds[i].pid <= 0, wds[i].url, wds[i].downloaded, wds[i].size, wds[i].drate);
			write(sock, msg, len);
			free(msg);
		}
	}
	write(sock, "\n\n", 2);
	return 0;
}

int cmd_wgetd(char* request, int sock) {
	char ac[33];
	char url[500];
	int spaused;
	sscanf(request, "SUBMITWDOWNLOAD /%32s/%d/%499s", ac, &spaused, url);
	if (!check_auth(ac, sock))
		return 0;
	if (!start_wget(url)) {
		write(sock, http_bad_req, strlen(http_bad_req));
	} else {
		write(sock, http_200, strlen(http_200));
		write(sock, "\n\n", 2);
	}
	return 0;
}

//suburl, download_completed, setfilestodownload, gettorrentdetails  use this
#define clean(err,b,sock,msg) 		if (err) {\
	write(sock, http_bad_req, strlen(http_bad_req) - 2);\
	write(sock, http_html, strlen(http_html));\
	if (msg != NULL) {\
	write(sock, msg, strlen(msg));\
	syslog(LOG_INFO, msg);\
}\
	write(sock, "\n\n", 2);\
}\
	if (b) free(b);

static unsigned long long torrent_dir_size;

void sizecallback(char* fname) {
	struct stat buf;
	if (stat(fname, &buf)==0 && !S_ISDIR(buf.st_mode)) {
			torrent_dir_size += buf.st_size;
	}
}

int cmd_gettorrentdetails(char* request, int sock) {
	char ac[33];
	sscanf(request, "GETTDETAILS /%32s/", ac);
	if (!check_auth(ac, sock))
		return 0;
	int len = 0;
	sscanf(request + 45, "/%d/", &len);
	struct torrent_t* trs = get_torrents();
	if (len <= 0) {
		clean(1, NULL, sock, "INVALID REQUEST");
		return 0;
	}
	int size = len * 50;
	char *buff = malloc(size * sizeof(char));
	if (buff == NULL) {
		clean(1, NULL, sock, "NOT ENOUGH MEMORY");
		return 0;
	}
	*buff = 0;
	int idx = 0, blen = 0;
	char *tok;
	strtok(request+45, "/");//len
	while ( (tok = strtok(NULL, "/")) && idx++ < len ) {
		char* endptr;
		int num = strtol(tok, &endptr, 0);
		if (*endptr) {
			clean(1, buff, sock, "INVALID REQUEST");
			return 0;
		}
		tok = 0;
		tok = getTorrentDir(num);
		if (!tok) {
			clean(1, buff, sock, "INVALID REQUEST");
			return 0;
		}
		
		int dlen = strlen(download_dir);
		char fname[dlen + 2 + strlen(tok)];
		strcpy(fname, download_dir);
		if (fname[dlen -1] != '/')
			strcat(fname, "/");
		strcat(fname, tok);
		torrent_dir_size = 0;
		struct stat buf;
		if (stat(fname, &buf)==0) {
			if (!S_ISDIR(buf.st_mode)) {
				torrent_dir_size = buf.st_size;
			} else {
				listdir(fname, 0, 0, 1, 1, sizecallback);
			}
		}
		#ifdef DEBUG
			printf("finished collecting file sizes\n");
		#endif
		char* msg;
		int mlen = asprintf(&msg, "%s\t%llu\n", tok, torrent_dir_size);
		blen += mlen;
		if (blen >= size) {
			char *tmp = realloc(buff, size = size + (len + 1 - idx) * mlen);
			if (!tmp) {
				clean(1, buff, sock, "NOT ENOUGH MEMORY");
				free(tok);
				free(msg);
				#ifdef DEBUG
					printf("error getting torrent details, not enough memory\n");
				#endif
				return 0;
			}
			buff = tmp;
		}
		strcat(buff, msg);
		free(tok);
		free(msg);
		#ifdef DEBUG
			printf("finished with torrent %s\n", fname);
		#endif
	}
	write(sock, http_200, strlen(http_200));
	write(sock, http_text, strlen(http_text));
	char *msg;
	len = asprintf(&msg, "%s\n", detailpre ? detailpre : "");
	write(sock, msg, len);
	write(sock, buff, blen);
	write(sock, "\n\n", 2);
	free(msg);
	free(buff);
	#ifdef DEBUG
		printf("sent torrent details to gui\n");
	#endif
	syslog(LOG_DEBUG, "sent torrent details to gui");
	return 0;
}

int cmd_setfilestodownload(char* request, int sock) {
	char ac[33];
	sscanf(request, "SETFILES /%32s/", ac);
	if (!check_auth(ac, sock))
		return 0;
	int len = 0, cid = -1;
	sscanf(request + 42, "/%d/%d/", &cid, &len);
	struct ctorrent_t* cls = get_clients();
	if (cid >= MAX_CLIENTS || cid < 0 || !cls[cid].valid || cls[cid].protocol < 3) {
		clean(1, NULL, sock, "INVALID REQUEST OR CLIENT PROTOCOL IS LESS THAN 3");
		return 0;
	}
	if (len <= 0) {
		write(cls[cid].socket, "CTCONFIG file_list *\n", 21);
		write(cls[cid].socket, "SENDCONF\n", 9);
		write(sock, http_200, strlen(http_200));
		write(sock, "\n\n", 2);
		return 0;
	}
	int size = len * 3;
	char *buff = malloc(size * sizeof(char));
	if (buff == NULL) {
		clean(1, NULL, sock, "NOT ENOUGH MEMORY");
		return 0;
	}
	*buff = 0;
	int idx = 0, blen = 0;
	char *tok;
	strtok(request+42, "/");//id
	strtok(NULL, "/");//len
	while ( (tok = strtok(NULL, "/")) && idx++ < len ) {
		int num = atoi(tok), found = 0;
		struct ctfile_t *file;
		for (file = cls[cid].files.next; file; file = file->next) {
			if (file->fileno == num) {
				found = 1;
				break;
			}
		}
		if (!found) {
			clean(1, buff, sock, "INVALID REQUEST");
			return 0;
		}
		tok = 0;
		asprintf(&tok, "%d", num);
		blen += strlen(tok) + 1;
		if (blen >= size) {
			char *tmp = realloc(buff, size = size + 100);
			if (!tmp) {
				clean(1, buff, sock, "NOT ENOUGH MEMORY");
				free(tok);
				return 0;
			}
			buff = tmp;
		}
		strcat(buff, tok);
		strcat(buff, "+");
		free(tok);
	}
	buff[blen - 1] = 0;
	char * msg;
	len = asprintf(&msg, "CTCONFIG file_list %s\n", buff);
	write(cls[cid].socket, msg, len);
	free(msg);
	free(buff);
	write(cls[cid].socket, "SENDCONF\n", 9);
	write(sock, http_200, strlen(http_200));
	write(sock, "\n\n", 2);
	syslog(LOG_DEBUG, "sent file_list: %s to client: %d", buff, cid);
	return 0;
}

int cmd_getstats(char* request, int sock) {
	char ac[33];
	sscanf(request, "GETSTATS /%32s", ac);
	if (!check_auth(ac, sock))
		return 0;

	write(sock, http_200, strlen(http_200));
	write(sock, http_text, strlen(http_text));

	char *msg;
	int len;
	unsigned long long dsize = 0, dfree = 0;
	diskfree(download_dir, &dsize, &dfree);
	update_stat_time();
	len = asprintf(&msg, "%llu\t%llu\t%u\t%u\t%llu\t%llu\t\n", stats.up, stats.down, stats.totaltime,
			stats.sumtorrents, dsize, dfree);
	write(sock, msg, len);
	free(msg);
	write(sock, "\n\n", 2);
	return 0;
}


void download_completed(int succ, int sock, const char* const path, int start_paused) {
	if (succ) {
		write(sock, http_200, strlen(http_200));
		write(sock, http_html, strlen(http_html));
		write(sock, "FILE UPLOADED\n\n", 15);
		#ifdef DEBUG
			printf("file downloaded\n");
		#endif
		syslog(LOG_DEBUG, "file downloaded");
		clean(0, 0, sock, 0);
		add_torrent(path, start_paused);
		start_client(path);
	} else {
		#ifdef DEBUG
			printf("can not download fille wget error\n");
		#endif
		syslog(LOG_WARNING, "can not download file");
		clean(1, 0, sock, "CAN NOT DOWNLOAD FILE");
	}
	shutdown(sock, SHUT_RDWR);
	close(sock);
}

int cmd_suburl(char* request, int sock) {

	char ac[33];
	char url[500];
	int ci, spaused;
	sscanf(request, "SUBMITURL /%32s/%d/%499s", ac, &spaused, url);
	if (!check_auth(ac, sock))
		return 0;
	
	int flen = 0;
	char *filename = NULL;
	char *port = NULL;
	char *node = NULL;
	char *c = strstr(url, "://");
	if (c) {
		char *e = strchr(c = c + 3, '/');
		if (e) {
			node = malloc(e - c + 1);
			*node = 0;
			strncpy(node, c, e - c);
			*(node + (e - c)) = 0;
			e = strchr(node, ':');
			if (e) {
				*e++ = 0;
				port = strdup(e);
			} else
				port = strdup("80");
		}
	}
	if (node) {
		struct addrinfo hints, *res;
		bzero(&hints, sizeof(struct addrinfo));
		hints.ai_family=PF_INET;
		hints.ai_socktype=SOCK_STREAM;
		//hints.ai_flags=AI_NUMERICSERV;not available in openwrt
		int err = getaddrinfo(node, /*port*/NULL, &hints, &res);
		if (err) {
			const char *msg = gai_strerror(err);
			#ifdef DEBUG
				printf("could not get ip address for: %s, reason: %s\n", node, msg);
			#endif
			syslog(LOG_INFO, "could not get ip address for: %s, reason: %s", node, msg);
		} else {
			int rsock = socket(res->ai_family, res->ai_socktype, res->ai_protocol);
			((struct sockaddr_in*)res->ai_addr)->sin_port=htons(atoi(port));
			if (connect(rsock, res->ai_addr, res->ai_addrlen) == -1) {
				char * msg = strerror(errno);
				#ifdef DEBUG
					printf("can not connect connect to %s, %s\n", node, msg);
				#endif
				syslog(LOG_INFO, "can not connect connect to %s, %s", node, msg);
				free(msg);
			} else {
				char* msg;
				int len = asprintf(&msg, "HEAD %s HTTP/1.0\n\n\n", url);
				err = send(rsock, msg, len, MSG_NOSIGNAL);
				free(msg);
				if (err != -1) {
					int size = 1024;
					char* response = malloc(size);
					int count, i, res = 0;
					if ( response )
					{
						do {
							int r = readline(rsock, response, size);
							if ( r <= 0 ) {
								break;
							}
							
							char *content;
							content = strstr(response, "Content-Disposition: ");
							if (content) {
								content = strstr(content, "filename=\"");
								if (content) {
									content += 10;
									filename = strrchr(content, '"');
									if (filename) {
										*filename = 0;
										filename = content;
									}
									if (filename == NULL || strstr(filename, "../") != NULL || strlen(filename) == 0) {
										filename = NULL;
									} else {
										filename = strdup(filename);
										flen = strlen(filename);
									}
								}
								break;
							}
							count = 0;
							if ( r >= 4 )
								for ( i = r - 4; i < r; i++ )
									if ( response[i] == '\n' )
										count++;
						} while ( count < 2 );
						free(response);
					}
				}
				shutdown(rsock, SHUT_RDWR);
				close(rsock);
			}
		}
		freeaddrinfo(res);
		free(node);
		free(port);
	}
	
	if (!filename) {
		filename = strrchr(url, '/');
		if (filename == NULL || strstr(++filename, "../") != NULL || (flen = strlen(filename)) == 0) {
			clean(1, 0, sock, "INVALID FILENAME");
			return 0;
		}
		filename = strdup(filename);
	}

	int ulen = strlen(upload_dir);
	char path[ulen + flen + 2];
	strcpy(path, upload_dir);
	if (path[ulen - 1] != '/')
		strcat(path, "/");
	strcat(path, filename);
	free(filename);
	
	for(ci = 0; ci < MAX_DOWNLOAD; ci++) {
		if (downloads[ci].pid == -1) break;
	}
	pid_t pid = -1;
	if (ci < MAX_DOWNLOAD) {
		downloads[ci].path = strdup(path);
		downloads[ci].sock = sock;
		downloads[ci].start_paused = (spaused != 0);
		if ( (pid = fork()) == 0) {
			dropconnections(sock);
			execl("/usr/bin/wget", "wget", "-q", "-O", path, url, NULL);
			#ifdef DEBUG
				printf("can not execute wget\n");
			#endif
			syslog(LOG_WARNING, "can not execute wget");
			clean(1, 0, sock, "CAN NOT START NEW DOWNLOAD");
			exit(-1);
		}
		downloads[ci].pid = pid;
	}
	if (pid == -1) {
		#ifdef DEBUG
			printf("fork error\n");
		#endif
		syslog(LOG_ERR, "can not fork to start wget");
		clean(1, 0, sock, "CAN NOT START NEW DOWNLOAD");
		if (ci < MAX_DOWNLOAD && downloads[ci].path) {
			free(downloads[ci].path);
			downloads[ci].path = 0;
			downloads[ci].pid = -1;
		}
		return 0;
	}
	return 1;
}

int cmd_getdetails(char* request, int sock) {
	char ac[33];
	int ci;
	sscanf(request, "GETDETAILS /%d/%32s", &ci, ac);
	if (!check_auth(ac, sock))
		return 0;
	struct ctorrent_t* cls = get_clients();
	int i;
	if (ci < 0 || ci >= MAX_CLIENTS || !cls[ci].valid) {
		write(sock, http_bad_req, strlen(http_bad_req));
		return 0;
	}
	write(sock, http_200, strlen(http_200));
	write(sock, http_text, strlen(http_text));

	struct ctfile_t *f;
	char *msg;
	int len;
	len = asprintf(&msg, "%s\n", detailpre ? detailpre : "");
	write(sock, msg, len);
	free(msg);
	len = asprintf(&msg, "%s\n", cls[ci].files.filename ? cls[ci].files.filename : "");
	write(sock, msg, len);
	free(msg);
	for(f = cls[ci].files.next; f; f = f->next) {
		len = asprintf(&msg, "%s\t%u\t%u\t%u\t%llu\t%d\t\n", f->filename, f->fileno, f->n_have, f->n_pieces, f->filesize, f->download);
		write(sock, msg, len);
		free(msg);
	}
	write(sock, "\n\n", 2);
	return 0;
}

int cmd_deltorrent(char* request, int sock) {
	char auth[33];
	int torrent, del;
	sscanf(request, "%*s /%d/%d/%32s", &torrent, &del, auth);
	if (!check_auth(auth, sock)) {
		return 0;
	}
	syslog(LOG_DEBUG, "deleting torrent num: %d", torrent);
	del_torrent(torrent, del);
	write(sock, http_200, strlen(http_200));
	write(sock, "\n\n",2);
	return 0;
}

int cmd_starttorrent(char* request, int sock){
	char auth[33];
	int torrent;
	sscanf(request, "%*s /%d/%32s", &torrent, auth);
	if (!check_auth(auth, sock)) {
		return 0;
	}
	start_torrent(torrent);
	write(sock, http_200, strlen(http_200));
	write(sock, "\n\n",2);
	return 0;
}

int cmd_gettorrents(char* request, int sock) {
	char ac[33];
	sscanf(request, "GETTORRENTS /%32s", ac);
	if (!check_auth(ac, sock))
		return 0;
	struct torrent_t* trs = get_torrents();
	int i;
	write(sock, http_200, strlen(http_200));
	write(sock, http_text, strlen(http_text));
	for(i = 0; i < MAX_TORRENTS; i++) {
		if (trs[i].name) {
			char *msg, *fname = NULL;
			fname = strstr(trs[i].name, upload_dir);
			if (fname) {
				fname += strlen(upload_dir);
				if (fname[0] == '/') fname++;
			} else {
				fname = trs[i].name;
			}

			int len = asprintf(&msg, "%s\t%hd\t%d\t%d\t%u\t%u\t%u\t\n", fname,
					    trs[i].status, trs[i].ctorrent, i, trs[i].n_have, trs[i].n_total, trs[i].piece_size);
			write(sock, msg, len);
			free(msg);
		}
	}
	write(sock, "\n\n", 2);
	return 0;
}

int cmd_pause(char* request, int sock) {
	char auth[33];
	int client;
	sscanf(request, "%*s /%d/%32s", &client, auth);
	if (!check_auth(auth, sock)) {
		return 0;
	}
	pause_client(client);
	write(sock, http_200, strlen(http_200));
	write(sock, "\n\n",2);
	return 0;
}

int cmd_update(char *request, int sock) {
	char auth[33];
	int client;
	sscanf(request, "%*s /%d/%32s", &client, auth);
	if (!check_auth(auth, sock)) {
		return 0;
	}
	refresh_client(client);
	write(sock, http_200, strlen(http_200));
	write(sock, "\n\n",2);
	return 0;
}

int cmd_quit(char* request, int sock) {
	char auth[33];
	int client;
	sscanf(request, "%*s /%d/%32s", &client, auth);
	if (!check_auth(auth, sock)) {
		return 0;
	}
	syslog(LOG_INFO, "got quit request from gui for client %d", client);
	quit_client(client);
	write(sock, http_200, strlen(http_200));
	write(sock, "\n\n", 2);
	return 0;
}

int cmd_setlimits(char* request, int sock) {
	int ulimit, dlimit, writeconf;
	char auth[33];
	int count = sscanf(request, "%*s /%d/%d/%d/%32s", &ulimit, &dlimit, &writeconf, auth);
	if (!check_auth(auth, sock))
		return 0;
	if (count != 4 || ulimit < 0 || dlimit < 0) {
		write(sock, http_bad_req, strlen(http_bad_req));
	} else {
		write(sock, http_200, strlen(http_200));
		write(sock, "\n\n",2);
		set_limits(ulimit, dlimit);
		if (writeconf)
			write_configfile();
		#ifdef DEBUG
			printf("%d/%d\n", ulimit, dlimit);
		#endif
		syslog(LOG_INFO, "set limits to ul: %d dl: %d", ulimit, dlimit);
	}
	return 0;
}

int cmd_getlimits(char* request, int sock) {
	char auth[33];
	sscanf(request, "%*s /%32s", auth);
	if (!check_auth(auth, sock)) {
		return 0;
	}
	int ulimit = get_ulimit(), dlimit = get_dlimit();
	write(sock, http_200, strlen(http_200));
	write(sock, http_html, strlen(http_html));
	char *msg;
	int len = asprintf(&msg, "%d/%d\n\n", ulimit, dlimit);
	write(sock, msg, len);
	#ifdef DEBUG
		printf("%s", msg);
	#endif
	free(msg);
	return 0;
}

int check_auth(char cookie[33], int sock) {
	if (auth.cookie == NULL || strncmp(cookie, auth.cookie, 32) != 0) {
		write(sock, http_403, strlen(http_403));
		write(sock, "\n\n", 2);
		#ifdef DEBUG
			printf("not authenticated\n");
		#endif
		return 0;
	}
	return 1;
}

void gen_challenge(char* buff) {
	int i;
	for (i = 0; i < 32; i++)
		buff[i] = (char) (33 + 94.0 * rand()/(RAND_MAX + 1.0));
	buff[32] = 0;
}

void gen_cookie(char* buff) {
	int i;
	for (i = 0; i < 32; i++) {
		buff[i] = (char) (65 + 51.0 * rand()/(RAND_MAX + 1.0));
		if (buff[i] > 90)
			buff[i] = buff[i] + 6;
	}
	buff[32] = 0;
}

void gen_answer(char* challenge, char* answer) {
	static const char* const hex_digits = "0123456789abcdef";
	MD5_CTX mctx;
	MD5_Init(&mctx);
	MD5_Update(&mctx, user, strlen(user));
	MD5_Update(&mctx, challenge, strlen(challenge));
	MD5_Update(&mctx, pass, strlen(pass));
	unsigned char dig[16];
	MD5_Final(dig, &mctx);
	answer[32] = 0;
	int i;
	for (i = 0; i < 16 ; i++) {
		answer[i * 2] = hex_digits[(dig[i] & 0xF0) >> 4];
		answer[i * 2 + 1] = hex_digits[dig[i] & 0x0F];
	}

	#ifdef DEBUG
		printf("%s\n", answer);
	#endif
}

int cmd_auth(char* request, int sock) {
	int type;
	char req[33];
	sscanf(request, "%*s /%d?%32s", &type, &req);
	if (type == 0) {
		time_t t = time(NULL);
		srand(t);
		write(sock, http_200, strlen(http_200));
		write(sock, http_html, strlen(http_html));
		gen_challenge(req);
		if (auth.cookie)
			free(auth.cookie);
		auth.cookie = malloc(33);
		gen_answer(req, auth.cookie);
		write(sock, req, 32);
		write(sock, "\n\n", 2);
	} else if (type == 1) {
		#ifdef DEBUG
			printf("%s\n", req);
		#endif
		if (strncmp(req, auth.cookie, 32) == 0) {
		    gen_cookie(auth.cookie);
		    write(sock, http_200, strlen(http_200));
		    write(sock, http_html, strlen(http_html));
		    write(sock, auth.cookie, 32);
		    write(sock, "\n\n", 2);
		}
		else {
		    write(sock, http_403, strlen(http_403));
		    write(sock, "\n\n", 2);
		}
	}
	return 0;
}

inline void cleanup(int sock, int err, char* b, char* f, char* msg) {
		if (err) {
			write(sock, http_403, strlen(http_403));
			write(sock, http_html, strlen(http_html));
			if (msg != NULL) {
				write(sock, msg, strlen(msg));
			}
			write(sock, "\n\n", 2);
		}
		if (b) free(b);
		if (f) free(f);
}

int cmd_upload(char* request, int sock) {

	char ac[33];
	int start_paused = 0;
	sscanf(request, "POST /upload?%32c?%d", ac, &start_paused);
	if (!check_auth(ac, sock))
		return 0;
	int r, size = 1024, blen;
	char buff[size];
	char *boundary = NULL, *filename = NULL;
	r = readline(sock, buff, size);
	if (r <= 0) {
		cleanup(sock, 1, boundary, filename, "NO DATA");
		return 0;
	}
	boundary = malloc(r);
	blen = r;
	if (buff[r-1] == '\n' || buff[r-1] == '\r') {buff[r-1] = 0;blen--;}
	if (buff[r-2] == '\n' || buff[r-2] == '\r') {buff[r-1] = 0;blen--;}
	strcpy(boundary, buff);
	blen = blen;

	r = readline(sock, buff, size);
	if (r <= 0) {
		cleanup(sock, 1, boundary, filename, "FORMAT ERROR");
		return 0;
	}
	char* f = strstr(buff, "filename=\"");
	if (f == NULL){
		cleanup(sock, 1, boundary, filename, "NO FILENAME GIVEN");
		return 0;
	}
	char *wf = strrchr(f, '\\');
	if (wf == NULL)
		wf = strrchr(f, '/');
	if (wf != NULL) {
		filename = malloc(&buff[r] - wf);
		strcpy(filename, wf + 1);
	} else {
		filename = malloc(&buff[r] - f);
		strcpy(filename, f + strlen("filename=\""));
	}
	int flen = strlen(filename) - 3;
	filename[flen] = 0;

	#ifdef DEBUG
		printf("filename:'%s'\n", filename);
	#endif

	if (strstr(filename, "../") != NULL) {
		cleanup(sock, 1, boundary, filename, "INVALID FILENAME");
		return 0;
	}

	int ulen = strlen(upload_dir);
	char path[ulen + flen + 2];
	strcpy(path, upload_dir);
	if (path[ulen - 1] != '/')
		strcat(path, "/");
	strcat(path, filename);
	int file = open(path, O_RDWR |  O_EXCL | O_CREAT, S_IRUSR);
	if (file == -1) {
		cleanup(sock, 1, boundary, filename, "CAN NOT CREATE FILE");
		return 0;
	}

	do {
		r = readline(sock, buff, size);
	} while ( r > 0 && (r != 1 && r != 2));
	if (r <= 0) {
		cleanup(sock, 1, boundary, filename, "NO DATA");
		return 0;
	}

	long  read = 0;
	while ( (r = readline(sock, buff, size)) > 0) {
		if (strncmp(buff, boundary, blen) == 0) {
			break;
		}

		if (write(file, buff, r) < 0) {
			cleanup(sock, 1, boundary, filename, "WRITE TO FILE FAILED");
			close(file);
			unlink(path);
			return 0;
		}
		read+=r;
	}
	ftruncate(file, read-2);
	close(file);
	write(sock, http_200, strlen(http_200));
	write(sock, http_html, strlen(http_html));
	write(sock, "FILE UPLOADED\n\n", 15);
	cleanup(sock, 0, boundary, filename, NULL);
	add_torrent(path, start_paused);
	start_client(path);
	syslog(LOG_INFO, "new file uploaded");
	return 0;
}

int cmd_getclientsinfo(char* request, int sock) {
	char ac[33];
	sscanf(request, "GETCLIENTSINFO /%32s", ac);
	if (!check_auth(ac, sock))
		return 0;
	struct ctorrent_t* cls = get_clients();
	int i;
	write(sock, http_200, strlen(http_200));
	write(sock, http_text, strlen(http_text));
	for(i = 0; i < MAX_CLIENTS; i++) {
		if (cls[i].valid) {
			char *msg, *fname = NULL;
			if (cls[i].fname)
				fname = strstr(cls[i].fname, upload_dir);
			if (fname) {
				fname += strlen(upload_dir);
				if (fname[0] == '/') fname++;
			}
			else
				fname = cls[i].fname;
			int len = asprintf(&msg, "%s\t%s\t%u\t%u\t%llu\t%u\t%u\t%llu\t%llu\t%d\t%u\t%u\t%u\t%u\t%u\t%hd\t%u\t%u\t%llu\t\n",
				fname, cls[i].severity != -1 ? cls[i].msg : "", cls[i].seeders, cls[i].leechers, cls[i].size,
			       	cls[i].dl_rate, cls[i].ul_rate, cls[i].dl_total, cls[i].ul_total, i, cls[i].dl_limit, cls[i].ul_limit, cls[i].n_have, cls[i].n_total,
	   			cls[i].piece_size, cls[i].paused, cls[i].total_time, cls[i].seed_time, cls[i].dsize);
			write(sock, msg, len);
			free(msg);
		}
	}
	write(sock, "\n\n", 2);
	return 0;
}

int cmd_get(char* cmd, int s) {
	int rlen = strlen(root_dir);
	int ilen = strlen(index_html);
	int size = rlen + ilen + 500;
	char path[size];
	int count = 0;
	const int buffsize = 1024;
	char buff[buffsize];

	strcpy(path, root_dir);
	sscanf(cmd, "GET %499s", &path[rlen]);
	char* c = strchr(path, '?');
	if (c != NULL)
		*c = 0;
	if (strcmp("/", &path[rlen]) == 0) {
		strcat(path, index_html);
	}
	
	#ifdef DEBUG
		printf("path: %s\n", path);
	#endif
	int file = open(path, O_RDONLY);
	if (file < 0 || strstr(path, "../") != NULL) {
		perror("open or path");
		write(s, http_error_notfound, strlen(http_error_notfound));
		if (file != -1)
			close(file);
		return 0;
	}


	while ( (count = read(file, buff, buffsize)) > 0 ) {
		if ( (count = send(s, buff, count, MSG_NOSIGNAL)) < 0) {
			perror("write");
			break;
		}
	}
	close(file);
	return 0;
}

int handle_gui(int sock)
{
	int read = 0, size = 1024;
	char* request = malloc(size);
	int count, i, res = 0;
	if ( request )
	{
		do {
			if ( size - read <= 4 ) {
				char *tmp = realloc( request, size+=1024 );
				if ( tmp != NULL )
					request = tmp;
			}
			int r = readline( sock, &request[read], size - read );
			if ( r <= 0 ) {
				free(request);
				close( sock );
				return -1;
			}
			read+=r;
			count = 0;
			if ( read >= 4 )
				for ( i = read - 4; i < read; i++ )
					if ( request[i] == '\n' )
						count++;
		} while ( count < 2 );
		#ifdef DEBUG
			printf( "wgui: %s", request );
		#endif
		syslog(LOG_DEBUG, "request from gui: %s", request);

		char command[50];
		command[0] = 0;
		sscanf( request, "%49s", command );

		for ( i = 0; i< MAX_COMMANDS; i++ )
			if ( strcmp( command, GCOMMANDS[i] ) == 0 ) {
				res = GCMD[i]( request, sock );
				break;
			}
	}
	if (!res) {
		shutdown(sock, SHUT_RDWR);
	}
	close(sock);
	free(request);
	return 0;
}
