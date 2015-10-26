#
# milli_httpd Makefile
#
# Copyright (C) 2008, Broadcom Corporation
# All Rights Reserved.
# 
# THIS SOFTWARE IS OFFERED "AS IS", AND BROADCOM GRANTS NO WARRANTIES OF ANY
# KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. BROADCOM
# SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
#
# $Id: Makefile,v 1.22 2005/01/24 00:48:07 Exp $
#

include $(TOP)/.config

CFLAGS	+= -I. -I$(TOP)/shared -I$(TOP)/rc -I$(SRCBASE)/include -I$(SRCBASE)/router/libbcm -Wall
#CFLAGS	+= -g -DDEBUG
CFLAGS	+= -s -O2
LDFLAGS	+= -L$(TOP)/nvram -L$(INSTALLDIR)/nvram/usr/lib -lnvram -L$(TOP)/libbcmcrypto -L$(INSTALLDIR)/libbcmcrypto/usr/lib -lbcmcrypto -L$(TOP)/shared -L$(TOP)/rc -L$(INSTALLDIR)/shared/usr/lib -lshared

OBJS := cgi.o ej.o httpd.o broadcom.o arcadyan.o access_control.o portrd.o

ifeq ($(CONFIG_EZC),y)
OBJS += ezc.o
endif

vpath %.c $(TOP)/shared
vpath %.c $(TOP)/rc
vpath %.o $(SRCBASE)/router/httpd/prebuilt

all: 

clean:


install: all
	install -D httpd $(INSTALLDIR)/usr/sbin/httpd
	$(STRIP) $(INSTALLDIR)/usr/sbin/httpd


