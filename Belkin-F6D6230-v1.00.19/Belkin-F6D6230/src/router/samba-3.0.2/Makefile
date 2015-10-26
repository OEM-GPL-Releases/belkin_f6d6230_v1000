#include $(TOP)/.config

all:
	$(MAKE) -C source

#romfs: all
#	$(ROMFSINST) source/bin/CP850.so /lib/CP850.so
#	$(ROMFSINST) source/bin/CP437.so /lib/CP437.so
#	$(ROMFSINST) source/bin/libbigballofmud.so /lib/libbigballofmud.so
#	ln -snf libbigballofmud.so $(ROOTDIR)/romfs/lib/libbigballofmud.so.0
#	$(ROMFSINST) source/bin/nmbd /sbin/nmbd
#	$(ROMFSINST) source/bin/smbd /sbin/smbd
#	$(ROMFSINST) source/bin/smbpasswd /sbin/smbpasswd
#	$(ROMFSINST) /bin/samba.sh
#	$(ROMFSINST) /bin/samba_add_dir.sh

install: all
	install -d $(INSTALLDIR)/usr/lib
	install -d $(INSTALLDIR)/lib/charset
	install -m 775 source/bin/libbigballofmud.so $(INSTALLDIR)/usr/lib/
	$(STRIP) $(INSTALLDIR)/usr/lib/libbigballofmud.so
	ln -snf libbigballofmud.so $(INSTALLDIR)/usr/lib/libbigballofmud.so.0
	install -D source/bin/nmbd $(INSTALLDIR)/usr/sbin/nmbd
	$(STRIP) $(INSTALLDIR)/usr/sbin/nmbd
	install -D source/bin/smbd $(INSTALLDIR)/usr/sbin/smbd
	$(STRIP) $(INSTALLDIR)/usr/sbin/smbd
	install -D source/bin/smbpasswd $(INSTALLDIR)/usr/sbin/smbpasswd
	$(STRIP) $(INSTALLDIR)/usr/sbin/smbpasswd
	install -m 775 source/bin/CP850.so $(INSTALLDIR)/lib/charset/
	$(STRIP) $(INSTALLDIR)/lib/charset/CP850.so
	install -m 775 source/bin/CP437.so $(INSTALLDIR)/lib/charset/
	$(STRIP) $(INSTALLDIR)/lib/charset/CP437.so
	install -D chpasswd.sh $(INSTALLDIR)/usr/sbin/chpasswd.sh
	install -D storage.sh $(INSTALLDIR)/usr/sbin/storage.sh
	install -D startsmb.sh $(INSTALLDIR)/usr/sbin/startsmb.sh
	install -D re_create_smbconf.sh $(INSTALLDIR)/usr/sbin/re_create_smbconf.sh

	#For Samba user account
	install -d $(INSTALLDIR)/etc/
	ln -sf /tmp/passwd $(INSTALLDIR)/etc/passwd
	ln -sf /tmp/group $(INSTALLDIR)/etc/group
	ln -sf /tmp/home $(INSTALLDIR)/home


	install -D samba.sh $(INSTALLDIR)/usr/sbin/samba.sh
	install -D samba_add_dir.sh $(INSTALLDIR)/usr/sbin/samba_add_dir.sh
	install -D smb.conf $(INSTALLDIR)/etc/smb.conf
#	install -D smbpasswd $(INSTALLDIR)/etc/smbpasswd

clean:
	$(MAKE) -C source clean
