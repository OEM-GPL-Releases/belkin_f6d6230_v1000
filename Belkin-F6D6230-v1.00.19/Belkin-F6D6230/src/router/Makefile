#
# Broadcom Linux Router Makefile
# 
# Copyright (C) 2008, Broadcom Corporation
# All Rights Reserved.
# 
# THIS SOFTWARE IS OFFERED "AS IS", AND BROADCOM GRANTS NO WARRANTIES OF ANY
# KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. BROADCOM
# SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
#
# $Id: Makefile,v 1.166 2009/01/15 22:50:43 Exp $
#

include .config




#
# Paths
#


CPU ?= 74k
LINUX_VERSION ?= 2_6

# Source bases
export PLATFORM LIBDIR USRLIBDIR
export TOP := $(shell pwd)
export SRCBASE := $(shell (cd $(TOP)/.. && pwd -P))

ifeq ($(LINUX_VERSION),2_6)
export 	LINUXDIR := $(SRCBASE)/linux/linux-2.6
else
export 	LINUXDIR := $(SRCBASE)/linux/linux
endif


#
# Cross-compile environment variables
#

# Build platform
export BUILD := i386-pc-linux-gnu
export HOSTCC := gcc

# uClibc wrapper
ifeq ($(CONFIG_UCLIBC),y)
export PLATFORM := $(PLATFORM)-uclibc
endif

ifeq ($(PLATFORM),mipsel)
export CROSS_COMPILE := mipsel-linux-
export CONFIGURE := ./configure mipsel-linux --build=$(BUILD)
export TOOLCHAIN := $(shell cd $(dir $(shell which $(CROSS_COMPILE)gcc))/../mipsel-linux && pwd -P)
endif

ifeq ($(PLATFORM),mipsel-uclibc)
export CROSS_COMPILE := mipsel-uclibc-
export CONFIGURE := ./configure mipsel-linux --build=$(BUILD)
export TOOLCHAIN := $(shell cd $(dir $(shell which $(CROSS_COMPILE)gcc))/.. && pwd -P)
endif


ifeq ($(CONFIG_BCMWPA2),y)
export CFLAGS += -DBCMWPA2
endif

ifeq ($(CONFIG_WSCCMD),y)
export CONFIG_WSCCMD
export CFLAGS += -DBCMWPS

endif

ifeq ($(CONFIG_EMF),y)
export CFLAGS += -D__CONFIG_EMF__
endif

ifeq ($(CONFIG_IGMP_PROXY),y)
export CFLAGS += -D__CONFIG_IGMP_PROXY__
endif

ifeq ($(CONFIG_SQUASHFS), y)
ROOT_IMG :=target.squashfs
else
ROOT_IMG := target.cramfs
endif

ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
CRAMFSDIR := cramfs
else
CRAMFSDIR := $(LINUXDIR)/scripts/cramfs
endif
export CC := $(CROSS_COMPILE)gcc
export AR := $(CROSS_COMPILE)ar
export AS := $(CROSS_COMPILE)as
export LD := $(CROSS_COMPILE)ld
export NM := $(CROSS_COMPILE)nm
export RANLIB := $(CROSS_COMPILE)ranlib
export STRIP := $(CROSS_COMPILE)strip
export SIZE := $(CROSS_COMPILE)size

#
# Install and target directories
#

export PLATFORMDIR := $(TOP)/$(PLATFORM)
export INSTALLDIR := $(PLATFORMDIR)/install
export TARGETDIR := $(PLATFORMDIR)/target

define STRIP_DEBUG_SYMBOLS
	@dbgsymf=$(basename $(1))_dbgsym$(suffix $(1)); \
	if [ "$(1)" -nt "$${dbgsymf}" ]; then \
	   echo "#- $0"; \
	   ls -ln $1 | awk '{printf "Orig  size: %10d bytes, %s\n",$$5,$$NF}'; \
	   cp -p -v $1 $$dbgsymf; $(STRIP) -d $(1); touch $$dbgsymf; \
	   ls -ln $1 | awk '{printf "Strip size: %10d bytes, %s\n",$$5,$$NF}'; \
	fi
endef



# USB AP support
# note : the dongle target is only for after pre-build 
obj-$(CONFIG_USBAP) += bmac libusb bcmdl dongle

# always build libbcmcrypto
obj-y += libbcmcrypto

#
# Configuration
#

obj-$(CONFIG_NVRAM) += nvram
obj-$(CONFIG_SHARED) += shared
obj-$(CONFIG_LIBBCM) += libbcm
obj-$(CONFIG_HTTPD) += httpd
obj-$(CONFIG_RC) += rc
obj-$(CONFIG_WWW) += www
obj-$(CONFIG_GLIBC) += lib
obj-$(CONFIG_UCLIBC) += lib
obj-$(CONFIG_WLCONF) += wlconf
obj-$(CONFIG_BRIDGE) += bridge
obj-$(CONFIG_BUSYBOX) += busybox
obj-$(CONFIG_DNSMASQ) += dnsmasq
obj-$(CONFIG_IPTABLES) += iptables
obj-$(CONFIG_LIBIPT) += iptables
obj-$(CONFIG_NAS) += nas
obj-$(CONFIG_SES) += ses/ses
obj-$(CONFIG_SES_CL) += ses/ses_cl
obj-$(CONFIG_EZC) += ezc
obj-$(CONFIG_NETCONF) += netconf
obj-$(CONFIG_NTP) += ntpclient
obj-$(CONFIG_PPP) += ppp
obj-$(CONFIG_UDHCPD) += udhcpd

ifeq ($(PROJECT_WG8116), y)
obj-$(CONFIG_LIBZ) += libz
obj-$(CONFIG_FFMPEG) += ffmpeg-0.5
obj-$(CONFIG_DLNA) += libdlna
TRX_MAGIC=00018116
CFLAGS+=-DPROJECT_WG8116
endif

obj-$(CONFIG_UPNP) += bcmupnp
obj-$(CONFIG_UTILS) += utils
obj-$(CONFIG_ETC) += etc
obj-$(CONFIG_VLAN) += vlan
obj-$(CONFIG_WSCCMD) += wps
obj-$(CONFIG_EMF) += emf
obj-$(CONFIG_EMF) += igs
obj-$(CONFIG_IGMP_PROXY) += igmp
ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
obj-y += udev
obj-y += hotplug2
endif

#if defined(BCMDBG)
obj-$(CONFIG_UTELNETD) += utelnetd
#endif

obj-$(CONFIG_RADVD) += radvd
obj-$(CONFIG_IPROUTE2) += iproute2
obj-$(CONFIG_IPUTILS) += iputils
obj-$(CONFIG_DHCPV6S) += dhcp6s
obj-$(CONFIG_DHCPV6C) += dhcp6c

ifeq ($(PROJECT_WG8116), y)
obj-y += lltd/wrt54g-linux
obj-y += samba-3.0.2
obj-y += ntfs-3g-2009.4.4
obj-y += transmission-1.75
obj-y += dctcs.src
obj-y += www2
obj-y += dctcs_confile_generator
obj-y += bwc
obj-y += wanstatus
obj-y += portrd
obj-y += shm
obj-y += UsbSMS
obj-y += belkin_ez_install
endif

ifeq ($(PROJECT_WG8117_2010), y)
obj-y += lltd_2010/wrt54g-linux
obj-y += samba-silex
obj-y += ntfs-3g-silex
obj-y += libsx
obj-y += sxutils
obj-y += libjcp
obj-y += jcpd
obj-y += sxstorage
obj-y += disktype
obj-y += mtools
obj-y += transmission-1.75
obj-y += dctcs.src
obj-y += www2
obj-y += dctcs_confile_generator
obj-y += arc_event
obj-y += wanstatus_2010
obj-y += portrd_2010
obj-y += shm_2010
obj-y += belkin_ez_install_new
obj-y += vod
endif

obj-y += pptp-1.6.0
obj-y += l2tpd
obj-y += usbrd
obj-y += httpd_watchdog
obj-y += start_pptp

# always build eap dispatcher
obj-y += eapd/linux

# Ron add BPAlogin
#obj-y += bpalogin

# Jimmy add dyndns
obj-y += DynDNS

obj-y += l7-protocols-2008-12-18

obj-y += ulogd

obj-clean := $(foreach obj,$(obj-y) $(obj-n),$(obj)-clean)
obj-install := $(foreach obj,$(obj-y),$(obj)-install)


ifneq ($(WLTEST),1)
ifneq ($(shell grep "CONFIG_EMBEDDED_RAMDISK=y" $(LINUXDIR)/.config),)
export WLTEST := 1
endif
endif
#
# Basic rules
#


all: version check_kernel_config $(obj-y)
        # Also build kernel
ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
	if ! grep -q "CONFIG_BLK_DEV_INITRD=y" $(LINUXDIR)/.config ; then \
		if grep -q "PROJECT_WG8116=y" $(SRCBASE)/router/.config ; then \
		    $(MAKE) -C $(LINUXDIR) zImage PROJECT_WG8116=y; \
		fi ;\
	    $(MAKE) CONFIG_SQUASHFS=$(CONFIG_SQUASHFS) -C $(SRCBASE)/router/compressed ; \
	fi
else
	if ! grep -q "CONFIG_EMBEDDED_RAMDISK=y" $(LINUXDIR)/.config ; then \
	    $(MAKE) -C $(LINUXDIR) zImage ; \
	fi
endif
	if grep -q "CONFIG_MODULES=y" $(LINUXDIR)/.config ; then \
	    $(MAKE) -C $(LINUXDIR) modules ; \
	fi
	# Preserve the debug versions of these and strip for release
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/vmlinux)
ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/wl/wl.ko)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/et/et.ko)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/bcm57xx/bcm57xx.ko)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/emf/emf.ko)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/igs/igs.ko)
else
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/wl/wl.o)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/et/et.o)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/bcm57xx/bcm57xx.o)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/emf/emf.o)
	$(call STRIP_DEBUG_SYMBOLS,$(LINUXDIR)/drivers/net/igs/igs.o)
endif


# well, we should always be able to use the BOM, but right now, the last build step on
# the build machine doesn't have it, so we don't rerun this is the file already 
# exists

version:  $(SRCBASE)/router/shared/router_version.h

# this could fail if the bom doesn't exist. We don't care as long as there is a valid router_version.h
# if not, the build will fail anyway.
$(SRCBASE)/router/shared/router_version.h: $(SRCBASE)/router/shared/version.h.in
	[ ! -e $(SRCBASE)/tools/release/linux-router-bom.mk  ] ||  make SRCBASE=$(SRCBASE) -f $(SRCBASE)/tools/release/linux-router-bom.mk version



router-clean: $(obj-clean) config-clean
	rm -rf $(TARGETDIR)
	rm -f $(PLATFORMDIR)/linux.trx $(PLATFORMDIR)/vmlinuz $(PLATFORMDIR)/target.squashfs.trim
	rm -f $(PLATFORMDIR)/linux.trx $(PLATFORMDIR)/vmlinuz $(PLATFORMDIR)/target.cramfs
	rm -f $(PLATFORMDIR)/linux-lzma.trx $(PLATFORMDIR)/vmlinuz-lzma $(PLATFORMDIR)/target.squashfs
	rm -rf $(INSTALLDIR)/busybox

clean: router-clean
	@echo cleaning LINUXDIR = $(LINUXDIR)
ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
	# we need to pass some conf file for cleaning 2.6. The kbuild clean doesn't seem to 
	# to load the .config the way our wl Makefile  is expecting.
	$(MAKE) CONFIG_WL_CONF=wlconfig_lx_router_ap -C $(LINUXDIR) clean
	$(MAKE) -C $(SRCBASE)/router/compressed clean
else
	$(MAKE) -C $(LINUXDIR) clean
endif
	$(MAKE) -C $(SRCBASE)/cfe/build/broadcom/bcm947xx clean
	$(MAKE) -C $(SRCBASE)/tools/misc clean

distclean mrproper: clean
	rm -f .config $(LINUXDIR)/.config

install package: $(filter-out lib-install,$(obj-install)) $(LINUXDIR)/.config
        # Install binaries into target directory
	install -d $(TARGETDIR)
	for dir in $(wildcard $(patsubst %,$(INSTALLDIR)/%,$(obj-y))) ; do \
	    (cd $${dir} && tar cpf - .) | (cd $(TARGETDIR) && tar xpf -) \
	done
	# optimize the crypto library by removing unneeded symbols
	[ ! -d libbcmcrypto ] || $(MAKE) -C libbcmcrypto optimize
        # Install (and possibly optimize) C library
	$(MAKE) lib-install
        # Install modules into filesystem
	if grep -q "CONFIG_MODULES=y" $(LINUXDIR)/.config ; then \
	    $(MAKE) -C $(LINUXDIR) modules_install DEPMOD=/bin/true INSTALL_MOD_PATH=$(TARGETDIR) ; \
	fi

ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
	find $(TARGETDIR) -name "wl_*.ko"  | xargs rm -rf
else
	find $(TARGETDIR) -name "wl_*.o"  | xargs rm -rf
endif

	cp -rf ../kernel_module/drivers $(TARGETDIR)/lib/modules/2.6.22/kernel/
	cp -rf ../kernel_module/lib $(TARGETDIR)/lib/modules/2.6.22/kernel/

        # Prepare filesystem
	cd $(TARGETDIR) && $(TOP)/misc/rootprep.sh
ifeq ($(CONFIG_SQUASHFS), y)
	# Make sure mksquashfs 3.0 is used
	$(MAKE) -C squashfs mksquashfs
	squashfs/mksquashfs $(TARGETDIR) $(PLATFORMDIR)/$(ROOT_IMG) -noappend -all-root
	for i in $(shell ls $(INSTALLDIR)/utils/usr/sbin) ; do \
		rm -f $(TARGETDIR)/usr/sbin/$${i} ; \
	done
	squashfs/mksquashfs $(TARGETDIR) $(PLATFORMDIR)/$(ROOT_IMG).trim -noappend -all-root
else
	# Make sure mkcramfs-2.0 is used
	$(MAKE) -C $(CRAMFSDIR) mkcramfs
	# '-u 0 -g 0' will set the uid and gid of all the files to 0 (root)
	# These options are currently only available on our version of mkcramfs
	$(CRAMFSDIR)/mkcramfs -u 0 -g 0 $(TARGETDIR) $(PLATFORMDIR)/$(ROOT_IMG)
endif

ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
	# Package kernel and filesystem
	if grep -q "CONFIG_BLK_DEV_INITRD=y" $(LINUXDIR)/.config ; then \
	    cd $(TARGETDIR) ; \
	    find . | cpio -o -H newc | gzip > $(LINUXDIR)/usr/initramfs_data.cpio.gz ; \
	    ls -l $(LINUXDIR)/usr/initramfs_data.cpio.gz ; \
	    $(MAKE) -C $(LINUXDIR) zImage PROJECT_WG8116; \
	    $(MAKE) -C $(SRCBASE)/router/compressed ; \
	else \
	    cp $(SRCBASE)/router/compressed/vmlinuz $(PLATFORMDIR)/ ; \
	    $(SRCBASE)/../tools/trx -p $(TRX_MAGIC) -o $(PLATFORMDIR)/linux.trx $(PLATFORMDIR)/vmlinuz $(PLATFORMDIR)/$(ROOT_IMG) ; \
	    addpattern -i $(PLATFORMDIR)/linux.trx -o $(PLATFORMDIR)/linux_lsys.bin ; \
		if grep -q "CONFIG_SQUASHFS=y" $(LINUXDIR)/.config ; then \
			cp $(SRCBASE)/router/compressed/vmlinuz-lzma $(PLATFORMDIR)/ ; \
			$(SRCBASE)/../tools/trx -p $(TRX_MAGIC) -o $(PLATFORMDIR)/linux-lzma.trx $(PLATFORMDIR)/vmlinuz-lzma $(PLATFORMDIR)/$(ROOT_IMG) ; \
			trx -o $(PLATFORMDIR)/linux-trim.trx $(PLATFORMDIR)/vmlinuz-lzma $(PLATFORMDIR)/$(ROOT_IMG).trim ; \
		fi \
	fi
	# Pad self-booting Linux to a 64 KB boundary
	cp $(SRCBASE)/router/compressed/zImage $(PLATFORMDIR)/
else
	# Package kernel and filesystem
	if grep -q "CONFIG_EMBEDDED_RAMDISK=y" $(LINUXDIR)/.config ; then \
	    cp $(PLATFORMDIR)/$(ROOT_IMG) $(LINUXDIR)/arch/mips/ramdisk/$${CONFIG_EMBEDDED_RAMDISK_IMAGE} ; \
	    $(MAKE) -C $(LINUXDIR) zImage ; \
	else \
	    cp $(LINUXDIR)/arch/mips/brcm-boards/bcm947xx/compressed/vmlinuz $(PLATFORMDIR)/ ; \
	    trx -o $(PLATFORMDIR)/linux.trx $(PLATFORMDIR)/vmlinuz $(PLATFORMDIR)/$(ROOT_IMG) ; \
	    addpattern -i $(PLATFORMDIR)/linux.trx -o $(PLATFORMDIR)/linux_lsys.bin ; \
		if grep -q "CONFIG_SQUASHFS=y" $(LINUXDIR)/.config ; then \
			cp $(LINUXDIR)/arch/mips/brcm-boards/bcm947xx/compressed/vmlinuz-lzma $(PLATFORMDIR)/ ; \
			trx -o $(PLATFORMDIR)/linux-lzma.trx $(PLATFORMDIR)/vmlinuz-lzma $(PLATFORMDIR)/$(ROOT_IMG) ; \
			trx -o $(PLATFORMDIR)/linux-trim.trx $(PLATFORMDIR)/vmlinuz-lzma $(PLATFORMDIR)/$(ROOT_IMG).trim ; \
		fi \
	fi
	# Pad self-booting Linux to a 64 KB boundary
	cp $(LINUXDIR)/arch/mips/brcm-boards/bcm947xx/compressed/zImage $(PLATFORMDIR)/
endif
	dd conv=sync bs=64k < $(PLATFORMDIR)/zImage > $(PLATFORMDIR)/linux.bin
	# Append filesystem to self-booting Linux
	cat $(PLATFORMDIR)/$(ROOT_IMG) >> $(PLATFORMDIR)/linux.bin

#
# Configuration rules
#

conf mconf:
	$(MAKE) -C config
	@./config/$@ ./config/Config
        # Also configure kernel
	$(MAKE) k$@

oldconf: .config
	$(MAKE) -C config
	@./config/conf -o ./config/Config
        # Also configure kernel
	$(MAKE) k$@

kconf:
	$(MAKE) -C $(LINUXDIR) config

kmconf: check_kernel_config 
	$(MAKE) -C $(LINUXDIR) menuconfig

koldconf: check_kernel_config
	$(MAKE) -C $(LINUXDIR) oldconfig

# Convenience
config: conf

menuconfig: mconf

oldconfig: oldconf

# Default configurations
ifneq ("$(LINUX_VERSION)","2_6")
.config:
	cp config/defconfig $@
	$(MAKE) oldconfig
else
.config:
	cp config/defconfig-2.6 $@
	$(MAKE) oldconfig
endif

ifneq ("$(CONFIG_USBAP)","y")
ifneq ("$(LINUX_VERSION)","2_6")
$(LINUXDIR)/.config:
	cp $(LINUXDIR)/arch/mips/defconfig-bcm947xx $@
else
$(LINUXDIR)/.config:
	cp $(LINUXDIR)/arch/mips/defconfig-bcm947xx-$(if $(CPU),$(CPU)-,)slimrtr $@
endif
else
ifneq ("LINUX_VERSION","2_6")
$(LINUXDIR)/.config:
	cp $(LINUXDIR)/arch/mips/defconfig-bcm947xx-usbap $@
else
$(LINUXDIR)/.config:
	cp $(LINUXDIR)/arch/mips/defconfig-bcm947xx-slimrtr-usbap $@
endif
endif

# Overwrite Kernel .config
check_kernel_config: $(LINUXDIR)/.config
	cp $(LINUXDIR)/.config $(LINUXDIR)/.config.tmp
ifeq ($(CONFIG_SQUASHFS), y)
	if ! grep -q "CONFIG_SQUASHFS=y" $(LINUXDIR)/.config ; then \
		cp $(LINUXDIR)/.config $(LINUXDIR)/.config.chk ; \
		sed -e "s/CONFIG_CRAMFS=y/# CONFIG_CRAMFS is not set/g" $(LINUXDIR)/.config.chk | \
		sed -e "s/# CONFIG_SQUASHFS is not set/CONFIG_SQUASHFS=y/g" > \
		$(LINUXDIR)/.config ; \
		rm -f $(LINUXDIR)/.config.chk ; \
	fi
endif
ifeq ($(CONFIG_CRAMFS), y)
	if ! grep -q "CONFIG_CRAMFS=y" $(LINUXDIR)/.config ; then \
		cp $(LINUXDIR)/.config $(LINUXDIR)/.config.chk ; \
		sed -e "s/CONFIG_SQUASHFS=y/# CONFIG_SQUASHFS is not set/g" $(LINUXDIR)/.config.chk | \
		sed -e "s/# CONFIG_CRAMFS is not set/CONFIG_CRAMFS=y/g" > \
		$(LINUXDIR)/.config ; \
		rm -f $(LINUXDIR)/.config.chk ; \
	fi
endif
ifeq ($(CONFIG_SHRINK_MEMORY), y)
	if ! grep -q "CONFIG_SHRINKMEM=y" $(LINUXDIR)/.config ; then \
		cp $(LINUXDIR)/.config $(LINUXDIR)/.config.chk ; \
		sed -e "s/# CONFIG_SHRINKMEM is not set/CONFIG_SHRINKMEM=y/g" $(LINUXDIR)/.config.chk > \
		$(LINUXDIR)/.config ; \
		rm -f $(LINUXDIR)/.config.chk ; \
	fi
else
	if grep -q "CONFIG_SHRINKMEM=y" $(LINUXDIR)/.config ; then \
		cp $(LINUXDIR)/.config $(LINUXDIR)/.config.chk ; \
		sed -e "s/CONFIG_SHRINKMEM=y/# CONFIG_SHRINKMEM is not set/g" $(LINUXDIR)/.config.chk > \
		$(LINUXDIR)/.config ; \
		rm -f $(LINUXDIR)/.config.chk ; \
	fi
endif
	# Make kernel config again if changed
	if ! cmp $(LINUXDIR)/.config $(LINUXDIR)/.config.tmp ; then \
		$(MAKE) -C $(LINUXDIR) oldconfig ; \
		$(MAKE) -C $(LINUXDIR) clean ; \
	fi
#
# Overrides
#

ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
busybox-1.x/Config.h: dummy
	cd busybox-1.x && rm -f Config.h && ln -sf include/autoconf.h Config.h && touch Config.h
	cd busybox-1.x && cp configs/bbconfig-$(CONFIG_BUSYBOX_CONFIG) .config && make clean

busybox: busybox-1.x/Config.h
	$(MAKE) -C busybox-1.x CROSS_COMPILE=mipsel-uclibc- ARCH=mips INSTALL

busybox-install:
	$(MAKE) -C busybox-1.x CROSS_COMPILE=mipsel-uclibc- ARCH=mips CONFIG_PREFIX=$(INSTALLDIR)/busybox install


rc: netconf nvram shared
	make LINUXDIR=$(LINUXDIR)  -C rc
ifneq ($(CONFIG_BUSYBOX),)
rc: busybox-1.x/Config.h
endif
else #linux-2.6
CURBBCFG=$(CONFIG_BUSYBOX_CONFIG).h
OLDBBCFG=$(shell basename $$(readlink busybox/Config.h) 2> /dev/null)
busybox/Config.h: dummy
ifneq ($(OLDBBCFG),$(CURBBCFG))
	cd busybox && rm -f Config.h && ln -sf configs/$(CURBBCFG) Config.h && touch Config.h
endif

busybox: busybox/Config.h
	$(MAKE) -C busybox STRIPTOOL=$(STRIP)

busybox-install:
	$(MAKE) -C busybox STRIPTOOL=$(STRIP) PREFIX=$(INSTALLDIR)/busybox install

rc: netconf nvram shared
ifneq ($(CONFIG_BUSYBOX),)
rc: busybox/Config.h
endif
endif #linux-2.6

rc-install:
	make LINUXDIR=$(LINUXDIR) INSTALLDIR=$(INSTALLDIR)/rc -C rc install

lib-install:
	make LX_VERS=$(LINUX_VERSION) INSTALLDIR=$(INSTALLDIR)/lib -C lib install

www www-%:
	$(MAKE) -C www/$(CONFIG_VENDOR) $* INSTALLDIR=$(INSTALLDIR)/www


#ifdef BCMDBG
BMAC_FIRM =rom-ag-debug
#else
BMAC_FIRM =rom-ag
#endif

bmac :
	make CROSS_COMPILE=arm-none-eabi -C $(SRCBASE)/dongle/rte/wl 4322-bmac-mips/$(BMAC_FIRM)

bmac-clean :
	make CROSS_COMPILE=arm-none-eabi -C $(SRCBASE)/dongle/rte/wl clean

bmac-install :
	install -d $(INSTALLDIR)/dongle/bin
	install  -D $(SRCBASE)/dongle/rte/wl/builds/4322-bmac-mips/$(BMAC_FIRM)/rtecdc.trx $(INSTALLDIR)/dongle/bin/rtecdc.trx



# To re-build bcmdl target, uncomment and exchange libusb and  bcmdl targets
# libusb :
#	cd $(SRCBASE)/usbdev/libusb; ./configure  --host=mipsel-linux CC=mipsel-uclibc-gcc; make


# bcmdl :
#	make TARGETENV=linuxmips -C $(SRCBASE)/usbdev/usbdl

# bcmdl-install :
#	install -d $(TARGETDIR)/bin
#	install -D $(SRCBASE)/usbdev/usbdl/bcmdl $(TARGETDIR)/bin/bcmdl

libusb :

bcmdl :

bcmdl-install :	
	install -d $(INSTALLDIR)/dongle/sbin
	install -D $(SRCBASE)/usbdev/usbdl/mips_$(LINUX_VERSION)/bcmdl $(INSTALLDIR)/dongle/sbin/bcmdl

bridge:
ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
	$(MAKE) -C bridge-1.x
else
	$(MAKE) -C bridge brctl/brctl
endif

dongle :

bridge-install:
ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
	install -D bridge-1.x/brctl/brctl $(INSTALLDIR)/bridge/usr/sbin/brctl
else
	install -D bridge/brctl/brctl $(INSTALLDIR)/bridge/usr/sbin/brctl
endif
	$(STRIP) $(INSTALLDIR)/bridge/usr/sbin/brctl

dnsmasq-install:
	install -D dnsmasq/dnsmasq $(INSTALLDIR)/dnsmasq/usr/sbin/dnsmasq
	$(STRIP) $(INSTALLDIR)/dnsmasq/usr/sbin/dnsmasq

ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
iptables:
	$(MAKE) -C iptables-1.x BINDIR=/usr/sbin LIBDIR=/usr/lib KERNEL_DIR=$(LINUXDIR)

iptables-install:
ifeq ($(CONFIG_IPTABLES),y)
	install -d $(INSTALLDIR)/iptables/usr/lib/iptables
	install iptables-1.x/extensions/*.so $(INSTALLDIR)/iptables/usr/lib/iptables
	$(STRIP) $(INSTALLDIR)/iptables/usr/lib/iptables/*.so
	install -D iptables-1.x/iptables $(INSTALLDIR)/iptables/usr/sbin/iptables
	$(STRIP) $(INSTALLDIR)/iptables/usr/sbin/iptables
else
        # So that generic rule does not take precedence
	@true
endif
iptables-clean:
	-$(MAKE) -C iptables-1.x KERNEL_DIR=$(LINUXDIR) clean
else # linux-2.6
iptables:
	$(MAKE) -C iptables BINDIR=/usr/sbin LIBDIR=/usr/lib KERNEL_DIR=$(LINUXDIR)

iptables-install:
ifeq ($(CONFIG_IPTABLES),y)
	install -d $(INSTALLDIR)/iptables/usr/lib/iptables
	install iptables/extensions/*.so $(INSTALLDIR)/iptables/usr/lib/iptables
	$(STRIP) $(INSTALLDIR)/iptables/usr/lib/iptables/*.so
	install -D iptables/iptables $(INSTALLDIR)/iptables/usr/sbin/iptables
	$(STRIP) $(INSTALLDIR)/iptables/usr/sbin/iptables
else
        # So that generic rule does not take precedence
	@true
endif
iptables-clean:
	-$(MAKE) -C iptables KERNEL_DIR=$(LINUXDIR) clean
endif # linux-2.6

nas: nvram shared

netconf: iptables
	make LINUXDIR=$(LINUXDIR) -C netconf
ntpclient-install:
	install -D ntpclient/ntpclient $(INSTALLDIR)/ntpclient/usr/sbin/ntpclient
	$(STRIP) $(INSTALLDIR)/ntpclient/usr/sbin/ntpclient

ppp ppp-%:
	$(MAKE) -C ppp/pppoecd $* INSTALLDIR=$(INSTALLDIR)/ppp
	$(MAKE) -C pppd $* INSTALLDIR=$(INSTALLDIR)/ppp

udhcpd-install:
	install -D udhcpd/udhcpd $(INSTALLDIR)/udhcpd/usr/sbin/udhcpd
	$(STRIP) $(INSTALLDIR)/udhcpd/usr/sbin/udhcpd
	cd $(INSTALLDIR)/udhcpd/usr/sbin && ln -sf udhcpd udhcpc

upnp: netconf nvram shared

bcmupnp: netconf nvram shared

	[ ! -f bcmupnp/Makefile ] || $(MAKE) -C bcmupnp

bcmupnp-install:
	[ ! -f bcmupnp/Makefile ] || $(MAKE) -C bcmupnp install INSTALLDIR=$(INSTALLDIR)/bcmupnp

bcmupnp-clean:
	[ ! -f bcmupnp/Makefile ] || $(MAKE) -C bcmupnp clean
wlconf: nvram shared

vlan:
	$(MAKE) -C vlan CROSS=$(CROSS_COMPILE) STRIPTOOL=$(STRIP)

vlan-install:
	$(MAKE) -C vlan CROSS=$(CROSS_COMPILE) STRIPTOOL=$(STRIP) INSTALLDIR=$(INSTALLDIR) install

vlan-clean:
	$(MAKE) -C vlan clean


emf:
	$(MAKE) -C emf/emfconf CROSS=$(CROSS_COMPILE)

emf-install:
ifeq ($(CONFIG_EMF),y)
	install -d $(TARGETDIR)
	$(MAKE) -C emf/emfconf CROSS=$(CROSS_COMPILE) INSTALLDIR=$(INSTALLDIR) install
endif

emf-clean:
	$(MAKE) -C emf/emfconf clean

igs:
	$(MAKE) -C emf/igsconf CROSS=$(CROSS_COMPILE)

igs-install:
ifeq ($(CONFIG_EMF),y)
	install -d $(TARGETDIR)
	$(MAKE) -C emf/igsconf CROSS=$(CROSS_COMPILE) INSTALLDIR=$(INSTALLDIR) install
endif

igs-clean:
	$(MAKE) -C emf/igsconf clean
igmp:
	$(MAKE) -C igmp CROSS=$(CROSS_COMPILE)

igmp-install:
ifeq ($(CONFIG_IGMP_PROXY),y)
	install -d $(TARGETDIR)
	$(MAKE) -C igmp CROSS=$(CROSS_COMPILE) INSTALLDIR=$(INSTALLDIR) install
endif

igmp-clean:
	$(MAKE) -C igmp clean

ifeq ($(LINUXDIR), $(SRCBASE)/linux/linux-2.6)
udev:
	$(MAKE) -C udev CROSS_COMPILE=$(CROSS_COMPILE)

udev-install:
	install -d $(TARGETDIR)
	$(MAKE) -C udev CROSS_COMPILE=$(CROSS_COMPILE) DESTDIR=$(INSTALLDIR) prefix=/udev install-udevtrigger

udev-clean:
	$(MAKE) -C udev clean

hotplug2:
	$(MAKE) -C hotplug2 CROSS_COMPILE=$(CROSS_COMPILE)

hotplug2-install:
	install -d $(TARGETDIR)
	install -d $(INSTALLDIR)/hotplug2
	$(MAKE) -C hotplug2 CROSS_COMPILE=$(CROSS_COMPILE) PREFIX=$(INSTALLDIR) install

hotplug2-clean:
	$(MAKE) -C hotplug2 clean
endif



ifeq ($(LINUX_VERSION),2_6)
UCLIBC_IPV6=-L ../lib/mipsel-uclibc/
else
UCLIBC_IPV6=../lib/mipsel-uclibc/libc.so.0
endif

radvd: flex dummy
	[ ! -d $@ ] || [ -f $@/Makefile ] || ( cd $@ && CC=$(CC) ./configure --host=mipsel-linux && cd .. )
	[ ! -d $@ ] || $(MAKE) -C radvd CC=$(CC) radvd_LDADD="-L../flex -lfl"

radvd-install:
	[ ! -d radvd ] || install -D -m 755 radvd/radvd $(INSTALLDIR)/radvd/usr/sbin/radvd
	[ ! -d radvd ] || $(STRIP) $(INSTALLDIR)/radvd/usr/sbin/radvd

radvd-clean:
	[ ! -f radvd/Makefile ] || $(MAKE) -C radvd distclean

flex: dummy
	[ ! -d $@ ] || [ -f $@/Makefile ] || ( cd $@ && CC=$(CC) ./configure --host=mipsel-linux && cd .. )
	[ ! -d $@ ] || $(MAKE) -C flex CC=$(CC) RANLIB=$(RANLIB)

iproute2:
	[ ! -d $@ ] || $(MAKE) -C iproute2 KERNEL_INCLUDE=$(LINUXDIR)/include CC=$(CC) AR=$(AR) LDLIBS=

iproute2-install:
	[ ! -d iproute2 ] || install -D -m 755 iproute2/ip/ip $(INSTALLDIR)/iproute2/usr/sbin/ip
	[ ! -d iproute2 ] || $(STRIP) $(INSTALLDIR)/iproute2/usr/sbin/ip
	[ ! -d iproute2 ] || install -D -m 755 iproute2/tc/tc $(INSTALLDIR)/iproute2/usr/sbin/tc
	[ ! -d iproute2 ] || $(STRIP) $(INSTALLDIR)/iproute2/usr/sbin/tc

iputils:
	[ ! -d $@ ] || [ -f $@/include-glibc/bits/socket.h ] || ( cd $@/include-glibc/bits && ln -s ../socketbits.h socket.h && cd ../../.. )
	[ ! -d $@ ] || $(MAKE) -C iputils KERNEL_INCLUDE=$(LINUXDIR)/include CC=$(CC) LDLIBS=

iputils-install:
	[ ! -d iputils ] || install -D -m 755 iputils/ping6 $(INSTALLDIR)/iputils/usr/sbin/ping6
	[ ! -d iputils ] || $(STRIP) $(INSTALLDIR)/iputils/usr/sbin/ping6
	[ ! -d iputils ] || install -D -m 755 iputils/traceroute6 $(INSTALLDIR)/iputils/usr/sbin/traceroute6
	[ ! -d iputils ] || $(STRIP) $(INSTALLDIR)/iputils/usr/sbin/traceroute6
	[ ! -d iputils ] || install -D -m 755 iputils/tracepath6 $(INSTALLDIR)/iputils/usr/sbin/tracepath6
	[ ! -d iputils ] || $(STRIP) $(INSTALLDIR)/iputils/usr/sbin/tracepath6

dhcp6s dhcp6c: dummy
	[ ! -d dhcp6 ] || [ -f dhcp6/Makefile ] || ( cd dhcp6 && ./configure CC=gcc CFLAGS+="-I../shared" && cd .. )
ifeq ($(CONFIG_UCLIBC),y)
	[ ! -d dhcp6 ] || $(MAKE) -C dhcp6 CC=$(CC) LIBS="$(UCLIBC_IPV6)" $@
else
	[ ! -d dhcp6 ] || $(MAKE) -C dhcp6 CC=$(CC) LIBS="-lresolv -L../libbcmcrypto -lbcmcrypto -L$(INSTALLDIR)/libbcmcrypto/usr/lib" $@
endif

dhcp6s-install:
	[ ! -d dhcp6 ] || install -D -m 755 dhcp6/dhcp6s $(INSTALLDIR)/dhcp6s/usr/sbin/dhcp6s
	[ ! -d dhcp6 ] || $(STRIP) $(INSTALLDIR)/dhcp6s/usr/sbin/dhcp6s

dhcp6c-install:
	[ ! -d dhcp6 ] || install -D -m 755 dhcp6/dhcp6c $(INSTALLDIR)/dhcp6c/usr/sbin/dhcp6c
	[ ! -d dhcp6 ] || $(STRIP) $(INSTALLDIR)/dhcp6c/usr/sbin/dhcp6c

dhcp6s-clean dhcp6c-clean:
	[ ! -f dhcp6/Makefile ] || $(MAKE) -C dhcp6 distclean

ifeq ($(PROJECT_WG8117_2010), y)

samba-silex:
	make -C samba-silex/source

samba-silex-install:
	install -d $(INSTALLDIR)/samba-silex
	install -d $(INSTALLDIR)/samba-silex/etc
	install -d $(INSTALLDIR)/samba-silex/usr/local
	install -D samba-silex/source/bin/smbmanager $(INSTALLDIR)/samba-silex/usr/sbin/smbmanager
	$(STRIP) $(INSTALLDIR)/samba-silex/usr/sbin/smbmanager
	ln -fs smbmanager $(INSTALLDIR)/samba-silex/usr/sbin/smbd
	ln -fs smbmanager $(INSTALLDIR)/samba-silex/usr/sbin/nmbd
#	install -D samba-silex/source/bin/smbpasswd $(INSTALLDIR)/samba-silex/usr/sbin/smbpasswd
#	$(STRIP) $(INSTALLDIR)/samba-silex/usr/sbin/smbpasswd
	install -D samba-silex/silex/samba.sh $(INSTALLDIR)/samba-silex/usr/sbin/samba.sh
#	install -D -m 644 samba-silex/silex/smb.conf $(INSTALLDIR)/samba-silex/etc/samba/smb.conf
#	install -D -m 644 samba-silex/silex/smb.def.conf $(INSTALLDIR)/samba-silex/etc/samba/smb.def.conf
#	install -D -m 644 samba-silex/silex/smb.conf.default $(INSTALLDIR)/samba-silex/etc/samba/smb.debug.conf
	install -D -m 644 samba-silex/silex/smb.conf $(INSTALLDIR)/samba-silex/silex/etc/samba/smb.conf
	install -D -m 644 samba-silex/silex/smb.def.conf $(INSTALLDIR)/samba-silex/silex/etc/samba/smb.def.conf
	install -D -m 644 samba-silex/silex/smb.conf.default $(INSTALLDIR)/samba-silex/silex/etc/samba/smb.debug.conf
	ln -fs /tmp/local/samba $(INSTALLDIR)/samba-silex/usr/local/samba
	ln -fs /tmp/etc/samba $(INSTALLDIR)/samba-silex/etc/samba

samba-silex-clean:
	make -C samba-silex/source clean

libsx:

libsx-install:
	@true

libsx-clean:

sxutlis: libsx

sxutils-install:
	install -d $(INSTALLDIR)/sxutils
	install -D sxutils/sxsysconf $(INSTALLDIR)/sxutils/sbin/sxsysconf
	$(STRIP) $(INSTALLDIR)/sxutils/sbin/sxsysconf
	install -D sxutils/sxromconf $(INSTALLDIR)/sxutils/sbin/sxromconf
	$(STRIP) $(INSTALLDIR)/sxutils/sbin/sxromconf
	chmod 777 sxutils/scripts/etc/rc.d/*
	tar cf - -C sxutils/scripts . | tar xf - -C $(INSTALLDIR)/sxutils
	
	chmod 4755 sxutils/scripts/etc/rc.d
	chmod 4755 $(INSTALLDIR)/sxutils/etc/rc.d
	install -D sxutils/silex_conf.sh $(INSTALLDIR)/sxutils/usr/sbin/silex_conf.sh
	#install -D -m 644 sxutils/scripts/etc/silex/defsystem.conf $(INSTALLDIR)/sxutils/etc/sysconfig/system.conf
#	install -D -m 644 sxutils/scripts/etc/passwd.org $(INSTALLDIR)/sxutils/etc/passwd
#	install -D -m 644 sxutils/scripts/etc/group.org $(INSTALLDIR)/sxutils/etc/group
#	install -D -m 644 sxutils/scripts/etc/shadow.org $(INSTALLDIR)/sxutils/etc/shadow
	install -D -m 644 sxutils/scripts/etc/silex/defsystem.conf $(INSTALLDIR)/sxutils/silex/etc/sysconfig/system.conf
	install -D -m 644 sxutils/scripts/etc/passwd.org $(INSTALLDIR)/sxutils/silex/etc/passwd
	install -D -m 644 sxutils/scripts/etc/group.org $(INSTALLDIR)/sxutils/silex/etc/group
	install -D -m 644 sxutils/scripts/etc/shadow.org $(INSTALLDIR)/sxutils/silex/etc/shadow
	install -D -m 644 sxutils/scripts/etc/hosts $(INSTALLDIR)/sxutils/silex/etc/hosts
	ln -sf /tmp/mnt $(INSTALLDIR)/sxutils/mnt
	ln -sf /tmp/etc/sysconfig $(INSTALLDIR)/sxutils/etc/sysconfig
	ln -sf /tmp/etc/passwd $(INSTALLDIR)/sxutils/etc/passwd
	ln -sf /tmp/etc/group $(INSTALLDIR)/sxutils/etc/group
	ln -sf /tmp/etc/shadow $(INSTALLDIR)/sxutils/etc/shadow
	ln -sf /tmp/etc/hosts $(INSTALLDIR)/sxutils/etc/hosts

sxutils-clean:

libjcp:

libjcp-install:
	@true

libjcp-clean:

jcpd: libsx libjcp sxstorage

jcpd-install:
	install -d $(INSTALLDIR)/jcpd
	install -D jcpd/jcpd $(INSTALLDIR)/jcpd/usr/sbin/jcpd
	$(STRIP) $(INSTALLDIR)/jcpd/usr/sbin/jcpd

jcpd-clean:

sxstorage:

sxstorage-install:
	install -d $(INSTALLDIR)/sxstorage
	install -D sxstorage/script/sxnasctrl $(INSTALLDIR)/sxstorage/usr/sbin/sxnasctrl
	install -D sxstorage/script/hotplug $(INSTALLDIR)/sxstorage/sbin/hotplug
	install -D sxstorage/script/hotplug_misc.sh $(INSTALLDIR)/sxstorage/usr/sbin/hotplug_misc.sh
	#install -D sxstorage/test/hotplug.sh $(INSTALLDIR)/sxstorage/usr/sbin/hotplug.sh
	#install -D sxstorage/test/hotplug_test.sh $(INSTALLDIR)/sxstorage/usr/sbin/hotplug_test.sh
	#install -D -m 644 sxstorage/test/sda1.info $(INSTALLDIR)/sxstorage/usr/sbin/sda1.info
	tar cf - -C sxstorage/install . | tar xf - -C $(INSTALLDIR)/sxstorage

sxstorage-clean:

disktype:

disktype-install:
	install -D disktype/disktype $(INSTALLDIR)/disktype/usr/sbin/disktype
	$(STRIP) $(INSTALLDIR)/disktype/usr/sbin/disktype

disktype-clean:

mtools:

mtools-install:
	install -D mtools/mtools $(INSTALLDIR)/mtools/usr/sbin/mtools
	$(STRIP) $(INSTALLDIR)/mtools/usr/sbin/mtools
	ln -fs mtools $(INSTALLDIR)/mtools/usr/sbin/mlabel

mtools-clean:

ntfs-3g-silex:

ntfs-3g-silex-install:
	install -D ntfs-3g-silex/libntfs-3g/.libs/libntfs-3g.so.48.0.0 $(INSTALLDIR)/ntfs-3g-silex/usr/lib/libntfs-3g.so.48.0.0
	$(STRIP) $(INSTALLDIR)/ntfs-3g-silex/usr/lib/libntfs-3g.so.48.0.0
	ln -fs libntfs-3g.so.48.0.0 $(INSTALLDIR)/ntfs-3g-silex/usr/lib/libntfs-3g.so
	ln -fs libntfs-3g.so.48.0.0 $(INSTALLDIR)/ntfs-3g-silex/usr/lib/libntfs-3g.so.48
	install -D ntfs-3g-silex/src/.libs/ntfs-3g $(INSTALLDIR)/ntfs-3g-silex/usr/sbin/ntfs-3g
	$(STRIP) $(INSTALLDIR)/ntfs-3g-silex/usr/sbin/ntfs-3g
	ln -fs ntfs-3g $(INSTALLDIR)/ntfs-3g-silex/usr/sbin/ntfsvlabel

ntfs-3g-silex-clean:

endif

#
# Generic rules
#

%:
	[ ! -d $* ] || $(MAKE) -C $*

%-clean:
	[ ! -d $* ] || $(MAKE) -C $* clean

%-install:
	[ ! -d $* ] || $(MAKE) -C $* install INSTALLDIR=$(INSTALLDIR)/$*

$(obj-y) $(obj-n) $(obj-clean) $(obj-install): dummy

.PHONY: all clean distclean mrproper install package check_kernel_config
.PHONY: conf mconf oldconf kconf kmconf config menuconfig oldconfig
.PHONY: dummy
