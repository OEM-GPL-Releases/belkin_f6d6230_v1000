#
# Toplevel Makefile for the BCM947xx Linux Router release
#
# Copyright (C) 2008, Broadcom Corporation
# All Rights Reserved.
# 
# THIS SOFTWARE IS OFFERED "AS IS", AND BROADCOM GRANTS NO WARRANTIES OF ANY
# KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. BROADCOM
# SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
#
# $Id: toplevel-release.mk,v 1.32 2008/10/31 15:56:07 Exp $
#

SRCBASE := $(shell pwd)
RELEASEDIR := $(shell (cd $(SRCBASE)/.. && pwd -P))

export PROJ_ID := WG8116F22_LF_AK

install: all
	install -d $(RELEASEDIR)/image
ifeq ($(PROJ_ID), WG8116F22_LF_AK)
	$(MAKE) -C router install TRX_MAGIC=00018116
endif
	-cp router/mipsel/linux.trx $(RELEASEDIR)/image/linux-glibc.trx
	-cp router/mipsel-uclibc/linux.trx $(RELEASEDIR)/image/linux.trx
	-cp router/mipsel-uclibc/linux-lzma.trx $(RELEASEDIR)/image/linux-lzma.trx
	-cp router/mipsel-uclibc/linux-trim.trx $(RELEASEDIR)/image/linux-trim.trx
	-cp router/mipsel-uclibc/linux.bin $(RELEASEDIR)/image/linux.bin

all clean:
	$(MAKE) -C router $@


.PHONY: all clean install
