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
#ifndef WGETD_H_INCLUDED
#define WGETD_H_INCLUDED

#define MAX_WDOWNLOADS 50

struct wgetfile_t {
	unsigned long long filesize, downloaded;
	char *filename;
	struct wgetfile_t *next;
};

struct wget_t {
	void *stack;
	short used;
	unsigned long long size, downloaded;
	char *url;
	pid_t pid;
	unsigned int drate;
	struct wgetfile_t *files;
};

int del_wget(int widx);
int restart_wget(int num);
int stop_wget(int num);
int start_wget(const char* url);
struct wget_t* get_wgets();

#endif
