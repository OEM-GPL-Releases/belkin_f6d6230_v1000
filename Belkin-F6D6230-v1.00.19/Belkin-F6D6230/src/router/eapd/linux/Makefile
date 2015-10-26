#Linux Makefile

INCLUDE += -I. -I.. -I$(SRCBASE)/include -I$(SRCBASE)/shared -I$(SRCBASE)/router/shared -I$(SRCBASE)/router/nas

CFLAGS += $(INCLUDE)
CFLAGS += -DBCMWPA2 -DEAPD_WKSP_AUTO_CONFIG
CFLAGS += -Wall -DEAPDDUMP


LDFLAGS += -L$(TOP)/nvram -L$(INSTALLDIR)/nvram/usr/lib -lnvram
LDFLAGS += -L$(TOP)/shared -L$(INSTALLDIR)/shared/usr/lib -lshared

vpath %.c $(SRCBASE)/router/eapd $(SRCBASE)/shared

OBJS = eapd.o eapd_linux.o
OBJS += nas_eap.o wps_eap.o ses_eap.o

all:

install: all
	install -d $(INSTALLDIR)/bin
	install eapd $(INSTALLDIR)/bin
	$(STRIP) $(INSTALLDIR)/bin/eapd

clean:

