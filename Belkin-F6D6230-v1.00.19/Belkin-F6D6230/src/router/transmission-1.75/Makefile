#include $(TOP)/.config

all:

clean:

install:
ifeq ($(PROJECT_WG8117_2010), y)
	#install -d $(INSTALLDIR)/usr/bin
	#install -D daemon/transmission-daemon $(INSTALLDIR)/usr/bin/transmission-daemon
	#$(STRIP) $(INSTALLDIR)/usr/bin/transmission-daemon
	install -D daemon/transmission-remote $(INSTALLDIR)/usr/bin/transmission-remote
	$(STRIP) $(INSTALLDIR)/usr/bin/transmission-remote
	cd $(INSTALLDIR)/usr/bin && ln -sf transmission-remote trr
endif
