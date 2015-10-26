#
# Router rc control scripts Makefile
#
# Copyright (C) 2008, Broadcom Corporation
# All Rights Reserved.
# 
# THIS SOFTWARE IS OFFERED "AS IS", AND BROADCOM GRANTS NO WARRANTIES OF ANY
# KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. BROADCOM
# SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
#
# $Id: Makefile,v 1.43 2008/11/26 07:30:46 Exp $
#

include $(TOP)/.config

ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
CFLAGS += -DLINUX26
CFLAGS += -I. -I$(TOP)/shared -I$(SRCBASE)/include -Wall -I$(LINUXDIR)/include -I$(TOP)/busybox-1.x 
else
CFLAGS += -I. -I$(TOP)/shared -I$(TOP)/busybox -I$(SRCBASE)/include -Wall 
endif

ifeq ($(CONFIG_SW3_CODE), y)
ifeq ($(CONFIG_RECONNECT_BUTTON), y)
CFLAGS += -DRECONNECT_BUTTON
endif

ifeq ($(CONFIG_BWC), y)
CFLAGS += -D__CONFIG_BWC__
endif

ifeq ($(CONFIG_WIRELESS_DEFAULT_SECURITY), y)
CFLAGS += -D__CONFIG_WIRELESS_DEFAULT_SECURITY__
endif

ifeq ($(CONFIG_QOS), y)
CFLAGS += -D__CONFIG_QOS__
endif
endif

#CFLAGS	+= -g -DDEBUG
CFLAGS	+= -s -O2
LDFLAGS	+= -L$(TOP)/nvram -L$(PLATFORMDIR)/install/nvram/usr/lib -lnvram -L$(TOP)/shared -L$(PLATFORMDIR)/install/shared/usr/lib -lshared \
	-L$(TOP)/libbcmcrypto -L$(INSTALLDIR)/libbcmcrypto/usr/lib -lbcmcrypto

OBJS := rc.o init.o interface.o network.o services.o udhcpc.o http.o stats.o bcmutils.o mtd.o usb_hotplug.o access_control.o 

ifeq ($(CONFIG_QOS), y)
OBJS += arc_qos.o
endif

ifeq ($(CONFIG_SMS), y)
OBJS += UsbSMSRC.o
endif

ifeq ($(CONFIG_NAT),y)
OBJS += firewall.o
LDFLAGS += -L$(TOP)/netconf -L$(PLATFORMDIR)/install/netconf/usr/lib -lnetconf
endif


ifeq ($(CONFIG_NAT),y)
OBJS += ppp.o
endif

vpath %.c $(TOP)/shared $(SRCBASE)/shared

all: 

clean:


install: all
	install -d $(INSTALLDIR)/sbin
	install -d $(INSTALLDIR)/etc
	install rc $(INSTALLDIR)/sbin
	$(STRIP) $(INSTALLDIR)/sbin/rc
	install -D fstab $(INSTALLDIR)/etc/fstab
	cd $(INSTALLDIR)/sbin && ln -sf rc init
	cd $(INSTALLDIR)/sbin && ln -sf rc erase
	cd $(INSTALLDIR)/sbin && ln -sf rc write
	cd $(INSTALLDIR)/sbin && ln -sf rc stats
	cd $(INSTALLDIR)/sbin && ln -sf rc hotplug
	cd $(INSTALLDIR)/sbin && ln -sf rc preinit
	cd $(INSTALLDIR)/sbin && ln -sf rc acscher
	cd $(INSTALLDIR)/sbin && ln -sf rc bpa_connect
	cd $(INSTALLDIR)/sbin && ln -sf rc bpa_disconnect
	cd $(INSTALLDIR)/sbin && ln -sf rc guestchk
	cd $(INSTALLDIR)/sbin && ln -sf rc routeadd
	ln -sf /tmp/resolv.conf $(INSTALLDIR)/etc/resolv.conf

rc: $(OBJS)
	$(CC) -o $@ $(OBJS) $(LDFLAGS)

%.o: .%.depend
.%.depend: %.c
	$(CC) $(CFLAGS) -M $< > $@

-include $(OBJS:%.o=.%.depend)
