#include $(TOP)/.config

all:

clean:

install:
	install -d $(INSTALLDIR)/usr/bin
	install -d $(INSTALLDIR)/usr/sbin
	install -d $(INSTALLDIR)/etc
	install -D src/dctcs $(INSTALLDIR)/usr/bin/dctcs
	mipsel-linux-strip $(INSTALLDIR)/usr/bin/dctcs
	install -D startdctcs.sh $(INSTALLDIR)/usr/sbin/startdctcs.sh
	install -D dctcs.conf $(INSTALLDIR)/etc/dctcs.conf
