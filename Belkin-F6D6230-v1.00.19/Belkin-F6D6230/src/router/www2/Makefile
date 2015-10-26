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

all: 

PAGES += bt_main.js \
	core.js \
	excanvas.js \
	gui.html \
	jquery_flot.js \
	progressbar.js

CSS += css/clickmenu.css \
		css/content.css \
		css/jquery.tooltip.css \
		css/main_router.css \
		css/progressbar.css \
		css/ui.css \
		css/menu.css

CSS_SMOOTHNESS += css/smoothness/jquery-ui-1.7.2.custom.css

CSS_SMOOTHNESS_IMAGE += css/smoothness/images/ui-bg_flat_0_aaaaaa_40x100.png \
		css/smoothness/images/ui-bg_flat_75_ffffff_40x100.png \
		css/smoothness/images/ui-bg_glass_55_fbf9ee_1x400.png \
		css/smoothness/images/ui-bg_glass_65_ffffff_1x400.png \
		css/smoothness/images/ui-bg_glass_75_dadada_1x400.png \
		css/smoothness/images/ui-bg_glass_75_e6e6e6_1x400.png \
		css/smoothness/images/ui-bg_glass_95_fef1ec_1x400.png \
		css/smoothness/images/ui-bg_highlight-soft_75_cccccc_1x100.png \
		css/smoothness/images/ui-icons_2e83ff_256x240.png \
		css/smoothness/images/ui-icons_222222_256x240.png \
		css/smoothness/images/ui-icons_454545_256x240.png \
		css/smoothness/images/ui-icons_888888_256x240.png \
		css/smoothness/images/ui-icons_cd0a0a_256x240.png

IMAGES = images/btn_add.gif \
		images/btn_del.gif \
		images/btn_pause_l.gif \
		images/btn_pause_s.gif \
		images/btn_pause_s_over.gif \
		images/btn_start_l.gif \
		images/btn_start_s.gif \
		images/btn_start_s_over.gif \
		images/drag_hint.gif \
		images/header_bg1.gif \
		images/header_bg1.jpg \
		images/health_1.gif \
		images/health_2.gif \
		images/health_3.gif \
		images/health_4.gif \
		images/health_hint.gif \
		images/pb_bg1.gif \
		images/pref.jpg \
		images/shadow2.png \
		images/shadow2-reverse.png \
		images/shadow_big.png \
		images/shadow.png \
		images/toolbar_bg1.jpg \
		images/toolbar_bg1_over.jpg \
		images/toolbar_bg1_gray.jpg \
		images/toolbar_bg2.jpg \
		images/toolbar_bg2_over.jpg \
		images/toolbar_bg2_gray.jpg \
		images/trashcan.gif \
		images/upload_stop.gif \
		images/upload_0p.gif \
		images/upload_100p.gif \
		images/upload_10p.gif \
		images/upload_20p.gif \
		images/upload_30p.gif \
		images/upload_40p.gif \
		images/upload_50p.gif \
		images/upload_60p.gif \
		images/upload_70p.gif \
		images/upload_80p.gif \
		images/upload_90p.gif \
		images/question_48.png \
		images/settings.png \
		images/add.png \
		images/warning_48.png \
		images/slider_bg.jpg \
		images/down_hint.png \
		images/up_hint.png \
		images/wait_hint.png \
		images/file_16.gif \
		images/folder_16.gif \
		images/btn_stop_l.gif \
		images/btn_stop_s.gif \
		images/btn_stop_s_over.gif \
		images/ok_hint.png

JS = js/jquery-1.3.2.min.js \
		js/jquery.bgiframe.js \
		js/jquery.dimensions.js \
		js/jquery.hoverIntent.js \
		js/jquery.metadata.js \
		js/jquery.tooltip.js \
		js/mbMenu.js \
		js/jquery-ui-1.7.2.custom.min.js \
		js/tablednd.js
		
install:
	install -d $(INSTALLDIR)/www2
	install -m 644 $(PAGES) $(INSTALLDIR)/www2

	install -d $(INSTALLDIR)/www2/images
	install -m 644 $(IMAGES) $(INSTALLDIR)/www2/images

	install -d $(INSTALLDIR)/www2/js
	install -m 644 $(JS) $(INSTALLDIR)/www2/js

	install -d $(INSTALLDIR)/www2/css
	install -m 644 $(CSS) $(INSTALLDIR)/www2/css

	install -d $(INSTALLDIR)/www2/css/smoothness
	install -m 644 $(CSS_SMOOTHNESS) $(INSTALLDIR)/www2/css/smoothness

	install -d $(INSTALLDIR)/www2/css/smoothness/images
	install -m 644 $(CSS_SMOOTHNESS_IMAGE) $(INSTALLDIR)/www2/css/smoothness/images

clean:
	rm -f pages.mk
