

include $(TOP)/.config

CFLAGS	+= -I.. -I$(SRCBASE)/include -I$(SRCBASE)/router/shared -I$(SRCBASE)/router/libbcm -Wall
LDFLAGS	+= -L$(TOP)/nvram -L$(INSTALLDIR)/nvram/usr/lib -lnvram 
LDFLAGS	+= -L$(TOP)/shared -L$(INSTALLDIR)/shared/usr/lib -lshared 
LDFLAGS	+= -L$(TOP)/libbcm -L$(INSTALLDIR)/libbcm/usr/lib -lbcm 
LDFLAGS	+= -L$(TOP)/libbcmcrypto -L$(INSTALLDIR)/libbcmcrypto/usr/lib -lbcmcrypto 

install: 
	install -D shmcreat $(INSTALLDIR)/usr/sbin/shmcreat
	$(STRIP) $(INSTALLDIR)/usr/sbin/shmcreat
	install -D ledd $(INSTALLDIR)/usr/sbin/ledd
	$(STRIP) $(INSTALLDIR)/usr/sbin/ledd
	install -D shmwrite $(INSTALLDIR)/usr/sbin/shmwrite
	$(STRIP) $(INSTALLDIR)/usr/sbin/shmwrite
	install -D ledtest $(INSTALLDIR)/usr/sbin/ledtest
	$(STRIP) $(INSTALLDIR)/usr/sbin/ledtest
	install -D reconnect $(INSTALLDIR)/usr/sbin/reconnect
	$(STRIP) $(INSTALLDIR)/usr/sbin/reconnect
	install -D Eco_mode $(INSTALLDIR)/usr/sbin/Eco_mode
	$(STRIP) $(INSTALLDIR)/usr/sbin/Eco_mode


all:

clean:


