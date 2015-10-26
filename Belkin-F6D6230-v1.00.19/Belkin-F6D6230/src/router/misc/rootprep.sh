#!/bin/bash
#
# Miscellaneous steps to prepare the root filesystem
#
# Copyright (C) 2008, Broadcom Corporation
# All Rights Reserved.
# 
# THIS SOFTWARE IS OFFERED "AS IS", AND BROADCOM GRANTS NO WARRANTIES OF ANY
# KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. BROADCOM
# SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
#
# $Id: rootprep.sh,v 1.16 2008/11/26 07:38:16 Exp $
#

ROOTDIR=$PWD

# tmp
mkdir -p tmp
ln -sf tmp/var var
ln -sf tmp/media media
(cd $ROOTDIR/usr && ln -sf ../tmp)

# dev
mkdir -p dev

# etc
mkdir -p etc
echo "/lib" > etc/ld.so.conf
echo "/usr/lib" >> etc/ld.so.conf
echo "127.0.0.1 localhost.localdomain localhost" > etc/hosts
/sbin/ldconfig -r $ROOTDIR

# miscellaneous
mkdir -p sys
mkdir -p mnt
mkdir -p proc
#(cd $ROOTDIR/lib && ln -sf libc.so.0 libgcc_s.so.1)
