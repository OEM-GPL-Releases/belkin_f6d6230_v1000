#!/bin/sh

cd /bin
adduser -D -H guest
cd /usr/sbin
./samba.sh Belkin_N+ Belkin_N+
#./samba_add_dir.sh tmp /tmp guest
./smbpasswd guest
chmod 777 /tmp

#./nmbd
#./smbd

cd /lib/modules/2.6.22/kernel/drivers/usb/host
insmod ohci-hcd.ko
insmod ehci-hcd.ko
cd


