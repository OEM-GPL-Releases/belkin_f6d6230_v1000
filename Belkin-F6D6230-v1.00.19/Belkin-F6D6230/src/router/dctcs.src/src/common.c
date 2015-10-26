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

#include <dirent.h>
#include <stdlib.h>
#include <string.h>
#include <sys/stat.h>
#include <stdio.h>
#include <signal.h>
#include <sys/statvfs.h>
#include <sched.h>
#include <syslog.h>

#include "common.h"

int diskfree(const char* const path, unsigned long long *disksize, unsigned long long *diskfree) {
	struct statvfs buf;
	int err;
	if ((err=statvfs(path, &buf))!=0)
		return err;
	*disksize=(unsigned long long) buf.f_blocks * buf.f_frsize;
	*diskfree=(unsigned long long) buf.f_bfree * buf.f_frsize;
	return 0;
}

int readline(int s, char* buff, int buffsize){
	int read = 0;
	buff[0]=0;
	buffsize--;//terminating '\0'
	do {
		int r = recv(s, &buff[read], 1, 0);
		if (r == -1)
		{
			#ifdef DEBUG
				perror("readline");
			#endif
			syslog(LOG_INFO, "error in readline (recv)");
			return -1;
		} else if (r == 0) {
			return read;
		}
		read+=r;
		buffsize--;
	} while( buff[read-1] != '\n' && buffsize != 0);
	buff[read] = 0;
	return read;
}

int listdir(const char* const path, char **names, int max, int appendPath, int recursive, listcallback_t callback) {
	int plen = strlen(path), c = 0;
	struct dirent* de;
	struct stat buf;
	char *fname;

	DIR* dir = opendir(path);
	if (dir == NULL) {
		perror("opendir");
		return -1;
	}

	while ( (de  = readdir(dir)) && ((c < max) || !names)) {
		if (strcmp(de->d_name, ".") == 0 || strcmp(de->d_name, "..") == 0)
			continue;
		fname = malloc(plen + strlen(de->d_name) + 2);
		strcpy(fname, path);
		if (fname[plen - 1] != '/')
			strcat(fname, "/");
		strcat(fname, de->d_name);
		if (stat(fname, &buf)==0) {
			if (!S_ISDIR(buf.st_mode)) {
				if (names)
					names[c] = strdup(appendPath?fname:de->d_name);
				#ifdef DEBUG
					printf("found file:%s\n", fname);
				#endif
				syslog(LOG_DEBUG, "listdir found file: %s", fname);
				c++;
			} else if (recursive) {
				int t = listdir(fname, names ? &names[c] : 0, max - c, appendPath, recursive, callback);
				if (t != -1)
					c += t;
			}
			if (callback)
				callback(appendPath ? fname : de->d_name);
		} else {
			perror("stat");
			syslog(LOG_WARNING, "stat error");
		}
		free(fname);
	}
	closedir(dir);
	return c;
}
