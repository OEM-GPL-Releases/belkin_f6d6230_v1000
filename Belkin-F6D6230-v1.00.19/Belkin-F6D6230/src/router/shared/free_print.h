#ifndef __FREE_PRINT__
#define __FREE_PRINT__
#include <stdio.h>
#include <string.h>
#include <stdlib.h>
#include <bcmconfig.h>

#ifdef printf
#undef printf
#endif
#ifdef __CONFIG_AVDEVICE_DEBUG_FREE__
#   define	FREE_PRINT(fmt, args...) { \
			printf("\n%s: %d "fmt"\n", __FUNCTION__,__LINE__ , ##args); \
			system("free"); \
			}
#else 
#   define FREE_PRINT(fmt, args...)
#endif //UPNP_DEBUG_MSG

#endif /* __FREE_PRINT__ */

