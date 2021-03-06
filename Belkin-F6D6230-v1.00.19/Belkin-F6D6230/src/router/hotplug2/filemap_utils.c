/*****************************************************************************\
*  _  _       _          _              ___                                   *
* | || | ___ | |_  _ __ | | _  _  __ _ |_  )                                  *
* | __ |/ _ \|  _|| '_ \| || || |/ _` | / /                                   *
* |_||_|\___/ \__|| .__/|_| \_,_|\__, |/___|                                  *
*                 |_|            |___/                                        *
\*****************************************************************************/

#include <string.h>
#include <stdlib.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/types.h>
#include <sys/stat.h>
#include <sys/mman.h>

#include "filemap_utils.h"

int map_file(char *filename, struct filemap_t *filemap) {
	struct stat statbuf;
	
	filemap->fd = open(filename, O_RDONLY);
	if (filemap->fd == -1) {
		return 1;
	}
	
	if (fstat(filemap->fd, &statbuf)) {
		close(filemap->fd);
		return 1;
	}
	
	filemap->size = statbuf.st_size;
	
	filemap->map = mmap(0, filemap->size, PROT_READ, MAP_SHARED, filemap->fd, 0);
	if (filemap->map == MAP_FAILED) {
		close(filemap->fd);
		return 1;
	}
	
	return 0;
}

int unmap_file(struct filemap_t *filemap) {
	close(filemap->fd);
	munmap(filemap->map, filemap->size);
	
	return 0;
}
