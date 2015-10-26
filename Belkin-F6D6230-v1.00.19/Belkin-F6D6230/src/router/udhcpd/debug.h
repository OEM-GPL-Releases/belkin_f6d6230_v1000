#ifndef _DEBUG_H
#define _DEBUG_H

#include "libbb_udhcp.h"

#include <stdio.h>
#ifdef SYSLOG
#include <syslog.h>
#endif

#define cprintf(fmt, args...) do { \
	FILE *fp = fopen("/dev/console", "w"); \
	if (fp) { \
		fprintf(fp, fmt , ## args); \
		fclose(fp); \
	} \
} while (0)

#ifdef SYSLOG
# define LOG(level, str, args...) do { cprintf("%s(%d): ", __FUNCTION__, __LINE__); cprintf(str, ## args); \
				cprintf("\n"); \
				syslog(level, str, ## args); } while(0)
#define OPEN_LOG(name) openlog(name, 0, 0)
//#define OPEN_LOG(name) openlog(name, LOG_PID | LOG_NDELAY, LOG_DAEMON);
#define CLOSE_LOG() closelog()
#else
# define LOG_EMERG	"EMERGENCY!"
# define LOG_ALERT	"ALERT!"
# define LOG_CRIT	"critical!"
# define LOG_WARNING	"warning"
# define LOG_ERR	"error"
# define LOG_INFO	"info"
# define LOG_DEBUG	"debug"
# define LOG(level, str, args...) do { printf("%s, ", level); \
				printf(str, ## args); \
				printf("\n"); } while(0)
# define OPEN_LOG(name) do {;} while(0)
#define CLOSE_LOG() do {;} while(0)
#endif

#ifdef DEBUG
# undef DEBUG
# define DEBUG(level, str, args...) LOG(level, str, ## args)
# define DEBUGGING
#else
# define DEBUG(level, str, args...) do {;} while(0)
#endif

#endif
