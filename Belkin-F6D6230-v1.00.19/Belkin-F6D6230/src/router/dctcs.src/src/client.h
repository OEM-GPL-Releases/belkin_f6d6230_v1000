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
#ifndef CLIENT_H_INCLUDED
#define CLIENT_H_INCLUDED

#define MAX_CLIENTS 50
#define MAX_TORRENTS (MAX_CLIENTS*2)

int CLIENT_PORT;
const char* client_host;

struct ctfile_t {
	unsigned int fileno, priority, n_pieces, n_have, n_available;
	unsigned long long filesize;
	char *filename;
	unsigned short download;
	struct ctfile_t *next;
};

struct ctorrent_t {
	unsigned int seeders;
	unsigned int leechers;
	unsigned int n_have;
	unsigned int n_total;
	unsigned int n_avail;
	unsigned int dl_rate;
	unsigned int ul_rate;
	unsigned long long dl_total;
	unsigned long long ul_total;
	unsigned int dl_limit;
	unsigned int ul_limit;
	unsigned long long size, dsize;
	unsigned int seed_time, total_time;
	unsigned long long start_time;
	double seed_ratio;
	unsigned int piece_size;
	unsigned short cmd_count;
	char* fname;
	int severity;
	char* msg;
	short valid;
	unsigned int udrates[2][3];
	unsigned short udidx;
	int socket;
	unsigned short paused;
	struct ctfile_t files;
	unsigned short protocol;
	char* dfiles;
};

struct torrent_t {
	char* name;
	unsigned short status;//0 not running 1 running 2 start_paused
	int ctorrent;
	char* dfiles;
	unsigned int n_have, n_total, piece_size;
};

int handle_client(int ci, int sock);
int init_client(int ci, int sock);
void update_status();
struct ctorrent_t* get_clients(void);
int get_ulimit(void);
int get_dlimit(void);
void set_limits(int ulimit, int dlimit);
void quit_client(int ci);
void refresh_client(int client);
void start_client(char const * const torrentfile);
void restart_torrents(void);
void pause_client(int ci);
void init_clients(int restart_torrents);
struct torrent_t* get_torrents(void);
void start_torrent(int ti);
void del_torrent(int ti, int deldata);
//does not check wheter this file already listed
void add_torrent(char const * const torrentfile, int start_paused);
//returns the directory where the torrent data resides (or the file name if the torrent consists only one file) without the download directory
char* getTorrentDir(int ti);
void set_checkival(unsigned int checkval);

#endif
