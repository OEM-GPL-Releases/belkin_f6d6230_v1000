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

#include <stdlib.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <stdio.h>
#include <netinet/in.h>
#include <string.h>
#include <arpa/inet.h>
#include <signal.h>
#include <getopt.h>
#include <dirent.h>
#include <errno.h>
#include <unistd.h>
#include <sys/wait.h>
#include <syslog.h>

#include "client.h"
#include "wgui.h"
#include "dctcs.h"
#include "common.h"

#define MAX_IDLE_COUNT 10

static int sock, sockg, restart=0, verbose = 0, checkval = 0, numq = 2;
static int clients[MAX_CLIENTS];
static const char *configfile;

void dropconnections(int except) {
	if (sock != except) close(sock);
	if (sockg != except) close(sockg);
	int i;
	for (i = 0; i < MAX_CLIENTS; i++)
		if (clients[i] && clients[i] != except)
			close(clients[i]);
}

void closesockets(void) {
	shutdown(sock, SHUT_RDWR);
	shutdown(sockg, SHUT_RDWR);
	int i;
	for (i = 0; i < MAX_CLIENTS; i++)
		if (clients[i])
			shutdown(clients[i], SHUT_RDWR);
}


void readsockets(fd_set* toread) {
	int i;
	for( i = 0; i < MAX_CLIENTS; i++) {
		if (FD_ISSET(clients[i], toread))
			if (handle_client(i, clients[i]) != 0) {
				shutdown(clients[i], SHUT_RDWR);
				close(clients[i]);
				clients[i] = 0;
			}
	}
}

void handle_new_connection(void) {
	int i;
	for (i = 0; i < MAX_CLIENTS; i++)
		if (!clients[i]) break;
	if (i < MAX_CLIENTS) {
		static struct sockaddr addr;
		static socklen_t len;
		clients[i] = accept(sock,  &addr, &len);
		if (clients[i] == -1)
		{
			clients[i] = 0;
			perror("accept: ");
		} else {
			if (init_client(i, clients[i]) != 0) {
				shutdown(clients[i], SHUT_RDWR);
				close(clients[i]);
				clients[i]=0;
			}
		}
	}
}

void handle_new_gui_connection(void) {
	static struct sockaddr addr;
	static socklen_t len;
	int guis = accept(sockg,  &addr, &len);
	if (guis == -1)
	{
		perror("accept: ");
	} else {
		handle_gui(guis);
	}
}

int parse_configfile(const char* const cfile);

void sighandler(int sig)
{
	#ifdef DEBUG
		printf("sig: %d\n",sig);
	#endif
	int stat;
	if (sig == SIGCHLD) {
		pid_t pid;
		int i;
		while( (pid = waitpid (WAIT_ANY, &stat, WNOHANG)) > 0)
			for (i=0; i < MAX_DOWNLOAD; i++)
				if (downloads[i].path && downloads[i].pid == pid) {
					if (WIFEXITED(stat) && WEXITSTATUS(stat) == 0) {
						download_completed(1, downloads[i].sock, downloads[i].path, downloads[i].start_paused);
					}
					free(downloads[i].path);
					downloads[i].path = 0;
					downloads[i].pid = -1;
					break;
				}
		return;
	} else if (sig == SIGHUP) {
		write_stats();
		parse_configfile(configfile);
		set_checkival(checkval);
		return;
	}
	closesockets();
	write_stats();
	exit(0);
};

void usage(void) {
	printf(		"Usage:\n\n"
			"dctcs [options]\n\n"
			"options:\n"
			"-t, --torrent-directory <dir> set torrent file upload directory\n"
			"-d, --download-directory <dir> set download directory\n"
			"-H, --htmlroot-directory <dir> set html root directory\n"
			"-c, --config-file <file> set config file to parse\n"
			"-C, --ctorrent <file> set ctorrent executable path\n"
			"-e, --exit-hours <int> ctorrent will exit after seeding <int> hours\n"
			"-E, --exit-ratio <num> ctorrent will exit after seeding to <num> ratio\n"
			"-U, --user <user> set user name\n"
			"-P, --password <pass> set password\n"
			"-h, --client-host <host:port> ctorrent client will use this server\n"
			"-p, --port <port> set the port on which to listen for connections\n"
			"-s, --cache-size <int> set the cache size of ctorrent clients\n"
			"-r, --restart-torrents [0|1] restart the uploaded torrent files at startup\n"
			"-D, --download-limit <int> set the global download speed limit [KiB/s] 0 turns it off\n"
			"-u, --upload-limit <int> set the global upload speed lmit [KiB/s] 0 turns it off\n"
			"--detail-url <url> set the url prepended to file names in the detail dialog\n"
			"--ctorrent-args <args> set any ctorrent options here or after --\n"
			"--ctorrent-complete <command> command to be run after downloading finished\n"
	      		"--write-stats [0|1] enable/disable writing of statistical data\n"
	      		"-v verbose output use more to get more log messages\n"
	      		"-i, --check-interval <min> check the torrent-directory every <min> minutes for new torrent which gets started\n"
	      		"-W, --wget <file> set wget executable path\n"
	      		"--wget-args <args> set any wget options here\n");
	exit(0);
}
struct option long_options[] =
		{
			{"torrent-directory",	required_argument,	0, 't' },
   			{"download-directory",	required_argument,	0, 'd' },
      			{"htmlroot-directory",	required_argument,	0, 'H' },
   			{"config-file",		required_argument,	0, 'c' },
      			{"ctorrent",		required_argument,	0, 'C' },
	 		{"exit-hours",		required_argument,	0, 'e' },
  			{"exit-ratio",		required_argument,	0, 'E' },
     			{"user",		required_argument,	0, 'U' },
     			{"password",		required_argument,	0, 'P' },
 			{"client-host",		required_argument,	0, 'h' },
    			{"port",		required_argument,	0, 'p' },
       			{"cache-size",		required_argument,	0, 's' },
	  		{"restart-torrents",	optional_argument,	0, 'r' },
     			{"help",		no_argument,		0, 'X' },
			{"download-limit",	required_argument,	0, 'D' },
   			{"upload-limit",	required_argument,	0, 'u' },
      			{"ctorrent-args",	required_argument,	0, 'Y' },
	 		{"detail-url",		required_argument,	0, 'Z' },
    			{"write-stats",		optional_argument,	0, 'Q' },
       			{"check-interval",	required_argument,	0, 'i' },
	  		{"wget",		required_argument,	0, 'W' },
     			{"wget-args",		required_argument,	0, 'w' },
     			{"ctorrent-complete",	required_argument,	0, 'm' },
   			{0,0,0,0}
};

void parse_arg(const char c, const char* const optarg) {
	char * endptr, *parse, *tok;
	long int hours;
	double ratio;
	int csize, i;
	switch (c) {
		case 'w':
			parse = strdup(optarg);
			i = 0;csize = 10;
			if (wgetargs)
				free(wgetargs);
			wgetargs = (char**)malloc(csize*sizeof(char*));
			tok = strtok(parse, " ");
			while(tok) {
				wgetargs[i] = tok;
				tok = strtok(NULL, " ");
				if (++i >= csize) {
					csize+=10;
					wgetargs = realloc(wgetargs, csize*sizeof(char*));
				}
			}
			if (i) {
				wgetargs[i] = NULL;
				wgetargs = realloc(wgetargs, sizeof(char*)*(i + 1));
				wgetargs_len = i + 1;
			}
			else {
				free(wgetargs);
				wgetargs_len = 0;
				wgetargs = NULL;
			}
			#ifdef DEBUG
				for(i = 0;i < wgetargs_len - 1;i++)
					printf("%c  = %s\n", c, wgetargs[i]);
			#endif
			break;
		case 'W':
			if ( access(optarg, X_OK | F_OK) == -1) {
				error(0, errno, "wget '%s'", optarg);
				syslog(LOG_WARNING, "wget is not accesible: %s", optarg);
			}
			wget_p = strdup(optarg);
			wget_c = (wget_c = strrchr(wget_p, '/')) == NULL ? wget_p : wget_c+1;
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'i':
			checkval = optarg ? atoi(optarg) : 0;
			#ifdef DEBUG
				printf("%c  = %d\n", c, checkval);
			#endif
			break;
		case 'v':
			verbose++;
			#ifdef DEBUG
				printf("%c  = %d\n", c, verbose);
			#endif
			break;
		case 'Q':
			writestats = optarg ? atoi(optarg) : 1;
			#ifdef DEBUG
				printf("%c  = %d\n", c, writestats);
			#endif
			break;
		case 'Z':
			detailpre = strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'm':
			if (completeargs)
				free(completeargs);
			completeargs = strdup(optarg);
			break;
		case 'Y':
			parse = strdup(optarg);
			i = 0;csize = 10;
			if (userargs)
				free(userargs);
			userargs = (char**)malloc(csize*sizeof(char*));
			tok = strtok(parse, " ");
			while(tok) {
				userargs[i] = tok;
				tok = strtok(NULL, " ");
				if (++i >= csize) {
					csize+=10;
					userargs = realloc(userargs, csize*sizeof(char*));
				}
			}
			if (i) {
				userargs[i] = NULL;
				userargs = realloc(userargs, sizeof(char*)*(i + 1));
				userargs_len = i + 1;
			}
			else {
				free(userargs);
				userargs_len = 0;
				userargs = NULL;
			}
			#ifdef DEBUG
				for(i = 0;i < userargs_len - 1;i++)
					printf("%c  = %s\n", c, userargs[i]);
			#endif
			break;
		case 'D':
			dlimit = atoi(optarg);
			if (dlimit < 0) {
				error(0, ERANGE, "download-limit %s", optarg);
				dlimit=0;
				return;
			}
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'u':
			ulimit = atoi(optarg);
			if (ulimit < 0) {
				error(0, ERANGE, "upload-limit %s", optarg);
				ulimit=0;
				return;
			}
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'r':
			restart = optarg ? atoi(optarg) : 1;
			#ifdef DEBUG
				printf("%c  = %d\n", c, restart);
			#endif
			break;
		case 'H':
			if ( access(optarg, R_OK | X_OK) == -1) {
				error(-1, errno, "htmlroot-directory '%s'", optarg);
			}
			root_dir = strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 't':
			if ( access(optarg,R_OK | W_OK | X_OK) == -1) {
				error(-1, errno, "torrent-directory '%s'", optarg);
			}
			upload_dir = strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'd':
			if ( access(optarg,R_OK | W_OK | X_OK) == -1) {
				error(-1, errno, "download-directory '%s'", optarg);
			}
			download_dir = strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'c':
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			if (parse_configfile(optarg) == 0) {
				configfile = strdup(optarg);
			}
			break;

		case 'C':
			if ( access(optarg, X_OK | F_OK) == -1) {
				error(-1, errno, "ctorrent '%s'", optarg);
			}
			cparam_p = strdup(optarg);
			cparam_0 = (cparam_0 = strrchr(cparam_p, '/')) == NULL ? cparam_p : cparam_0+1;
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'e':
			errno = 0;
			hours = strtol(optarg, &endptr, 0);
			if (errno != 0 || hours < 0) {
				if (errno == 0)
					errno = ERANGE;
				perror("exit-hours");
				return;
			}
			*endptr = 0;
			cparam_e = strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 's':
			errno = 0;
			csize = strtol(optarg, &endptr, 0);
			if (errno != 0 || csize < 0) {
				if (errno == 0)
					errno = ERANGE;
				perror("cache-size");
			}
			*endptr = 0;
			cparam_C = strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'E':
			errno = 0;
			ratio = strtod(optarg, &endptr);
			if (errno != 0 || ratio < 0) {
				if (errno == 0)
					errno = ERANGE;
				perror("exit-ratio");
				return;
			}
			*endptr = 0;
			cparam_E = strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'U':
			user = strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'P':
			pass = strdup( optarg );
			#ifdef DEBUG
				printf( "%c  = %s\n", c, optarg );
			#endif
			break;
		case 'h':
			endptr = strrchr(optarg, ':');
			CLIENT_PORT = endptr ? atoi(endptr+1) : CLIENT_PORT;
			if (CLIENT_PORT < 1 || CLIENT_PORT > 65535) {
				error(0, ERANGE, "client-host %s", optarg);
				syslog(LOG_WARNING, "client-host range error: %s", optarg);
				client_host = "localhost:15000";
				CLIENT_PORT = 15000;
				return;
			}
			client_host=strdup(optarg);
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'p':
			GUI_PORT = atoi(optarg);
			if (GUI_PORT < 1 || GUI_PORT > 65535 ) {
				error(0, ERANGE, "port %s", optarg);
				syslog(LOG_WARNING, "port range error: %s", optarg);
				GUI_PORT=18000;
				return;
			}
			#ifdef DEBUG
				printf("%c  = %s\n", c, optarg);
			#endif
			break;
		case 'X':
			usage();
			break;
	}
}

int parse_configfile(const char* const cfile) {
	size_t size = 0;
	char *buff = NULL;

	FILE* file = fopen(cfile, "r");
	if (!file) {
		error(0, errno, "configfile %s", cfile);
		syslog(LOG_WARNING, "can not open configfile: %s", cfile);
		return -1;
	}
	ssize_t read;
	while ( ( read = getline(&buff, &size, file) ) != -1) {
		if (buff[0]=='#' || read < 2)
			continue;
		char *opt,*optarg;
		opt = buff;
		optarg = strchr(buff, '=');
		if (opt[read - 1] == '\n')
			opt[read - 1] = 0;
		if (opt[read - 2] == '\r')
			opt[read - 2] = 0;
		if (!optarg) {
			fprintf(stderr, "syntax error in config file: '%s'\n", buff);
			syslog(LOG_INFO, "syntax error in config file: %s", buff);
			continue;
		}
		int len = optarg - opt;
		*optarg++ = 0;
		struct option *options = long_options;
		for (; options->name; options++) {
			if (strncmp(opt, options->name, len) == 0) {
				#ifdef DEBUG
					printf("found option: %s : %s\n", opt, optarg);
				#endif
				parse_arg(options->val, optarg);
				break;
			}
		}
		if (!options->name) {
			fprintf(stderr, "unknown option in config file: '%s'\n", opt);
			syslog(LOG_INFO, "unknown option in config file: '%s' ", opt);
		}
	}

	if (buff)
		free(buff);

	fclose(file);
	return 0;
}

char* gen_nline(char* const opts, char* const optarg) {
	char *msg = 0;
	if (opts == NULL) {
		char *fmt = malloc(13);
		fmt[0] = '\0';
		if (!long_options[14].flag) {
			strcpy(fmt, "%s=%d\n");
		}
		if (!long_options[15].flag) {
			strcat(fmt, "%s=%d\n");
		}
		if (!fmt[0]) {
			free(fmt);
			return NULL;
		}
		asprintf(&msg, fmt, long_options[14].name, dlimit, long_options[15].name, ulimit);
		free(fmt);
	}
	else {
		*optarg = '\0';
		struct option *options = long_options;
		for (; options->name; options++) {
			if (strcmp(opts, options->name) == 0) {
				options->flag = (int*)1;
				switch(options->val) {
					case 'D':
					case 'u':
						asprintf(&msg, "%s=%d\n", opts, options->val == 'D' ? dlimit : ulimit);
						break;
				}
				break;
			}
		}
	}
	if (!msg) {
		asprintf(&msg, "%s=%s\n", opts, optarg + 1);
	}
	return msg;
}

int write_configfile(void) {
	size_t size = 0;
	char *buff = NULL;
	char ncfg[strlen(configfile) + 3];

	syslog(LOG_DEBUG, "refreshing configuratin file %s", configfile);
	FILE* file = fopen(configfile, "r");
	if (!file) {
		#ifdef DEBUG
			error(0, errno, "configfile %s", configfile);
		#endif
		syslog(LOG_WARNING, "can not open configfile: %s", configfile);
		return -1;
	}
	strcpy(ncfg, configfile);
	strcat(ncfg, ".n");
	FILE* nfile = fopen(ncfg, "w");
	if (!nfile) {
		#ifdef DEBUG
			error(0, errno, "configfile %s", ncfg);
		#endif
		syslog(LOG_WARNING, "can not create temp configfile: %s", ncfg);
		fclose(file);
		return -1;
	}
	
	struct option *options = long_options;
	for (; options->name; options++) {
		options->flag = 0;
	}
	ssize_t read;
	while ( ( read = getline(&buff, &size, file) ) != -1) {
		if (buff[0]=='#' || read < 2) {
			fputs(buff, nfile);
			continue;
		}
		char *opt,*optarg;
		opt = buff;
		optarg = strchr(buff, '=');
		if (opt[read - 1] == '\n')
			opt[read - 1] = 0;
		if (opt[read - 2] == '\r')
			opt[read - 2] = 0;
		if (!optarg) {
			fputs(opt, nfile);
			fputs("\n", nfile);
			continue;
		}
		char *line = gen_nline(opt, optarg);
		fputs(line, nfile);
		free(line);
	}
	char* line = gen_nline(NULL, NULL);
	if (line) {
		fputs(line, nfile);
		free(line);
	}
	if (buff)
		free(buff);
	fclose(file);
	fclose(nfile);
	if (rename(ncfg, configfile)) {
		#ifdef DEBUG
			error(0, errno, "can not rename %s to %s", ncfg, configfile);
		#endif
		syslog(LOG_WARNING, "can not rename %s to %s", ncfg, configfile);
		unlink(ncfg);
		return -1;
	}
	return 0;
}

int main(int argc, char *argv[])
{
	int length,i,maxfd;

	#ifdef OLEGFW
		root_dir = "/opt/share/dctcs/www/darkside.ctcs.gui/";
		cparam_p = "/opt/bin/enhanced-ctorrent";
		cparam_0 = "enhanced-ctorrent";
		configfile = "/opt/etc/dctcs.conf";
		statfile = "/opt/etc/dctcs.stat";
		wget_p = "/opt/bin/wget";
		wget_c = "wget";
	#else
		root_dir = "/usr/share/dctcs/www/darkside.ctcs.gui/";
		cparam_p = "/usr/bin/ctorrent";
		cparam_0 = "ctorrent";
		configfile = "/etc/dctcs.conf";
		statfile = "/etc/dctcs.stat";
		wget_p = "/usr/bin/wget";
		wget_c = "wget";
	#endif

	index_html = "gui.html";
	upload_dir = "/mnt/disc0_1/torrent/";
	download_dir = "/mnt/disc0_1/";
	cparam_e = "168";
	cparam_E = "5.6";
	cparam_C = "1";
	userargs = NULL;
	completeargs = NULL;
	userargs_len = 0;
	GUI_PORT=18000;
	client_host="localhost:15000";
	CLIENT_PORT=15000;
	pass="just";
	user="me";
	ulimit = 0;
	dlimit = 0;
	wgetargs = NULL;
	wgetargs_len = 0;

	starttime = time(NULL);
	last_write_time = 0;

	for (i=0; i < MAX_DOWNLOAD; i++) {
		downloads[i].path = 0;
		downloads[i].pid = -1;
	}
	writestats = 1;

	openlog("dctcs", 0, LOG_DAEMON);

	parse_configfile(configfile);

	int c;
	while (1)
	{
		int option_index = 0;
		c = getopt_long (argc, argv, "t:d:c:C:e:E:U:P:h:p:s:r::D:u:vi:W:", long_options, &option_index);

		if (c == -1) break;

		parse_arg(c, optarg);
	}
	
	if (argc > optind) {
		int i,j;
		if (userargs) {
			userargs = realloc(userargs, sizeof(char*)*(argc - optind + userargs_len));
			j = userargs_len - 1;
		}
		else {
			userargs = malloc(sizeof(char*)*(argc - optind + 1));
			j = 0;
		}
		for(i = optind;i < argc; i++, j++)
			userargs[j] = argv[i];
		userargs[j] = NULL;
		userargs_len = j + 1;
	}

	#ifdef DEBUG
		printf("userargs:\n");
		char* tok;
		int k;
		for(k=0; k < userargs_len - 1;k++)
			printf("%s\n", userargs[k]);
	#endif

	int lmask;
	switch(verbose) {
		case 0:lmask = LOG_WARNING;break;
		case 1:lmask = LOG_NOTICE;break;
		case 2:lmask = LOG_INFO;break;
		default: lmask = LOG_DEBUG;
	}
	setlogmask(LOG_UPTO(lmask));

	struct sigaction sg;
	bzero(&sg, sizeof(struct sigaction));
	sg.sa_handler=sighandler;

	sigaction(SIGINT, &sg, NULL);
	sigaction(SIGQUIT, &sg, NULL);
	sigaction(SIGHUP, &sg, NULL);
	sigaction(SIGCHLD, &sg, NULL);
	sigaction(SIGTERM, &sg, NULL);
	
	sigset_t sigset;
	sigemptyset(&sigset);
	sigaddset(&sigset, SIGPIPE);
	sigaddset(&sigset, SIGUSR1);
	sigaddset(&sigset, SIGUSR2);
	sigprocmask(SIG_SETMASK, &sigset, NULL);


	const int bufflen = 500;
	char buff[bufflen];bzero(buff,bufflen);
	bzero(clients, MAX_CLIENTS * sizeof(int));

	struct sockaddr_in addr;
	addr.sin_family=AF_INET;
	addr.sin_addr.s_addr=INADDR_ANY;
	addr.sin_port=htons(CLIENT_PORT);
	length=sizeof(addr);

	int reuse = 1;
	sock=socket(PF_INET,SOCK_STREAM,0);
	setsockopt(sock, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(int));
	if (bind(sock,(struct sockaddr *) &addr, length) == -1)
	{
		perror("bind client port");
		syslog(LOG_ERR, "can not bind to client port");
		exit(-1);
	}

	addr.sin_family=AF_INET;
	addr.sin_addr.s_addr=INADDR_ANY;
	addr.sin_port=htons(GUI_PORT);
	length=sizeof(addr);

	sockg=socket(PF_INET,SOCK_STREAM,0);
	setsockopt(sockg, SOL_SOCKET, SO_REUSEADDR, &reuse, sizeof(int));
	if (bind(sockg,(struct sockaddr *) &addr, length) == -1)
	{
		perror("bind gui port");
		syslog(LOG_ERR, "can not bind to gui port");
		exit(-1);
	}


	struct timeval timeout;

	int idle_count = MAX_IDLE_COUNT;

	listen(sock,2);
	listen(sockg,1);
	#ifndef DEBUG
		if (daemon(0,0))
			perror("can not fork to background");
	#endif
	init_clients(restart);
	set_checkival(checkval);
	
	while (1) {
		static fd_set readfds;
		FD_ZERO(&readfds);
		FD_SET(sock, &readfds);
		FD_SET(sockg, &readfds);
		maxfd = sock > sockg ? sock : sockg;
		for (i = 0; i < MAX_CLIENTS; i++)
			if (clients[i]) {
				FD_SET(clients[i], &readfds);
				if (clients[i] > maxfd)
					maxfd = clients[i];
			}

		maxfd++;
		timeout.tv_sec = 30;
		timeout.tv_usec =0;
		int rcount = select(maxfd, &readfds, NULL, NULL, &timeout);
		if (rcount < 0) {
			if (errno != EINTR) {
				perror("select: ");
				syslog(LOG_WARNING, "error on select: %d", errno);
			}
			continue;
		} else if (rcount == 0) {
			idle_count--;
			#ifdef DEBUG
				printf(".\n");
			#endif
		}
		if (FD_ISSET(sock, &readfds)) {
			handle_new_connection();
			rcount--;
		}
		if (FD_ISSET(sockg, &readfds)) {
			handle_new_gui_connection();
			rcount--;
		}
		if (rcount > 0) {
			readsockets(&readfds);
		} else
			idle_count--;
		if (idle_count <= 0) {
			idle_count = MAX_IDLE_COUNT;
			update_status();
		}
	}
	shutdown(sock, SHUT_RDWR);
	#ifdef DEBUG
		printf("end\n");
	#endif
	return EXIT_SUCCESS;
}
