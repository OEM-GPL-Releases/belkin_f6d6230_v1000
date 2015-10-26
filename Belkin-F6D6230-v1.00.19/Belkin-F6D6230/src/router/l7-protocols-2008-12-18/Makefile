all:
	@echo Nothing to compile, just run \'make install\'
	@echo \(This simply copies this directory into $(PREFIX)/etc/l7-protocols \)	
install:
	install -d $(INSTALLDIR)/etc/l7-protocols
	install -d $(INSTALLDIR)/etc/l7-protocols/extra
	install -d $(INSTALLDIR)/etc/l7-protocols/file_types
	install -d $(INSTALLDIR)/etc/l7-protocols/malware
	install -d $(INSTALLDIR)/etc/l7-protocols/protocols

	install -m 775 ./extra/*.pat $(INSTALLDIR)/etc/l7-protocols/extra
	install -m 775 ./file_types/*.pat $(INSTALLDIR)/etc/l7-protocols/file_types
	install -m 775 ./malware/*.pat $(INSTALLDIR)/etc/l7-protocols/malware
	install -m 775 ./protocols/*.pat $(INSTALLDIR)/etc/l7-protocols/protocols
clean: