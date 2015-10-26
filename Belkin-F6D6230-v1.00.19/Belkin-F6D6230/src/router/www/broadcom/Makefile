#
# Broadcom web pages
#
# Copyright (C) 2008, Broadcom Corporation
# All Rights Reserved.
# 
# THIS SOFTWARE IS OFFERED "AS IS", AND ARCADYAN GRANTS NO WARRANTIES OF ANY
# KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. ARCADYAN
# SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
#
# $Id: Makefile,v 1.20 2007/03/07 04:12:34 Exp $
#

all: pages.mk

ifneq ($(WIND_HOST_TYPE),x86-win32)
$(SRCBASE)/router/.config:
	cp $(SRCBASE)/router/config/defconfig $@

include $(SRCBASE)/router/.config
endif

INCLUDING_BROADCOM_WEB = n

include wg8116_html

ifeq ($(INCLUDING_BROADCOM_WEB),y)
	PAGES += blur_new.jpg logo_new.gif repeat_edge_new.gif overlib.js style.css
	PAGES += index.asp basic.gif
	PAGES += lan.asp lan.gif
	ifeq ($(CONFIG_NAT),y)
		PAGES += wan.asp wan.gif
	endif
	PAGES += status.asp status.gif
	ifeq ($(CONFIG_NAT),y)
		PAGES += filter.asp filter.gif
		PAGES += forward.asp forward.gif
	endif
	PAGES += ssid.asp ssid.gif
	PAGES += radio.asp radio.gif
	PAGES += security.asp security.gif
	PAGES += firmware.asp firmware.gif
	PAGES += internal.asp internal.gif

	ifeq ($(CONFIG_WSCCMD),y)
		PAGES += wps_add.asp 
	endif
endif

ifneq ($(WIND_HOST_TYPE),x86-win32)
pages.mk: $(SRCBASE)/router/.config
	echo "PAGES := $(PAGES)" > $@
else
pages.mk:
	echo PAGES := $(PAGES) > $@
endif

IMAGES = images/apply1.gif \
		images/bar_floor.gif \
		images/blu_bar.gif \
		images/c1.gif \
		images/c4.gif \
		images/cancel.gif \
		images/chs1.gif \
		images/chs2.gif \
		images/cht1.gif \
		images/cht2.gif \
		images/close.gif \
		images/de1.gif \
		images/de2.gif \
		images/en1.gif \
		images/en2.gif \
		images/es1.gif \
		images/es2.gif \
		images/fr1.gif \
		images/fr2.gif \
		images/header_blank_02.gif \
		images/head_logo.gif \
		images/it1.gif \
		images/it2.gif \
		images/jp1.gif \
		images/jp2.gif \
		images/kr1.gif \
		images/kr2.gif \
		images/ne1.gif \
		images/ne2.gif \
		images/p1.gif \
		images/p.gif \
		images/pixel.gif \
		images/shim.gif \
		images/spacer.gif \
		images/title.gif \
		images/top_3.gif \
		images/man_blue_46.gif \
		images/wiz_white_46.gif \
		images/x_red.gif \
		images/welcome.gif \
		images/wiz_1.gif \
		images/wiz_2.gif \
		images/wiz_3.gif \
		images/popup_bg.gif \
		images/head_logo_guest.gif
		
		
install:
	install -d $(INSTALLDIR)/www
	install -m 644 $(PAGES) $(INSTALLDIR)/www

	install -d $(INSTALLDIR)/www/images
	install -m 644 $(IMAGES) $(INSTALLDIR)/www/images
clean:
	rm -f pages.mk
