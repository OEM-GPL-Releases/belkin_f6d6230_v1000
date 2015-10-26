#
# BPALogin Makefile
#
# Copyright (C) 2008, Arcadyan Corporation
# All Rights Reserved.
# 
# THIS SOFTWARE IS OFFERED "AS IS", AND BROADCOM GRANTS NO WARRANTIES OF ANY
# KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. BROADCOM
# SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
#
#

include $(TOP)/.config

CFLAGS	+= -I. -I$(TOP)/shared -I$(SRCBASE)/include -Wall
#CFLAGS	+= -g -DDEBUG
CFLAGS	+= -s -O
LDFLAGS	+= -L$(TOP)/nvram -L$(INSTALLDIR)/nvram/usr/lib -lnvram -L$(TOP)/libbcmcrypto -L$(INSTALLDIR)/libbcmcrypto/usr/lib -lbcmcrypto -L$(TOP)/shared -L$(INSTALLDIR)/shared/usr/lib -lshared

OBJS = bpalogin.o protocol.o transaction.o gen_md5.o unixmain.o

vpath %.c $(TOP)/shared
vpath %.o $(SRCBASE)/router/bpalogin/prebuilt

all: bpalogin

clean:
	rm -f *.o *~ bpalogin

install: all
	install -D bpalogin $(INSTALLDIR)/usr/sbin/bpalogin
	$(STRIP) $(INSTALLDIR)/usr/sbin/bpalogin

bpalogin: $(OBJS)
	$(CC) -o $@ $^ $(LDFLAGS)


