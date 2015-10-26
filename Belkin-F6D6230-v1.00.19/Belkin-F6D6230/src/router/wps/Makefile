#Linux Makefile

include $(LINUXDIR)/.config
 


clean:


install: 
	install -d $(INSTALLDIR)/usr/lib
	install -m 755 $(CC)/libwpscom.so $(INSTALLDIR)/usr/lib
	$(STRIP) $(INSTALLDIR)/usr/lib/libwpscom.so
	install -d $(INSTALLDIR)/bin
	[ ! -e wps_ap ] || install wps_ap $(INSTALLDIR)/bin
	[ ! -e wps_ap ] || $(STRIP) $(INSTALLDIR)/bin/wps_ap
	[ ! -e wps_monitor ] || install wps_monitor $(INSTALLDIR)/bin
	[ ! -e wps_monitor ] || $(STRIP) $(INSTALLDIR)/bin/wps_monitor
	[ ! -e wps_enr ] || install wps_enr $(INSTALLDIR)/bin
	[ ! -e wps_enr ] || $(STRIP) $(INSTALLDIR)/bin/wps_enr

phony:
