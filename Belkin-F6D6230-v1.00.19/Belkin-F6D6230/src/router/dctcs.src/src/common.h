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
#ifndef COMMON_H_INCLUDED
#define COMMON_H_INCLUDED

const char* root_dir;
const char* index_html;
const char* upload_dir;
const char* download_dir;
const char* cparam_p;
const char* cparam_0;
const char* cparam_e;
const char* cparam_E;
const char* cparam_C;
const char* user;
const char* pass;
const char* detailpre;
const char* wget_p;
const char* wget_c;
char** userargs;
char *completeargs;
int userargs_len;
int ulimit, dlimit;
const char* statfile;
int writestats;
char **wgetargs;
int wgetargs_len;

time_t starttime, last_write_time;

#define MAX_DOWNLOAD 5

struct down_t {
	char* path;
	pid_t pid;
	int sock;
	unsigned short start_paused;
};

struct down_t downloads[MAX_DOWNLOAD];

struct stats_t {
	unsigned long long up, down;//byte
	unsigned int totaltime/*sec*/, sumtorrents;
	long double reserverd;
};

struct stats_t stats;

typedef void listcallback_t (char* path);

int readline(int s, char* buff, int buffsize);
int listdir(const char* const path, char **names, int max, int appendPath, int recursive, listcallback_t callback);
int diskfree(const char* const path, unsigned long long *disksize, unsigned long long *diskfree);

#endif
