#
# Makefile for the Broadcom IGS Layer
#
# Copyright (C) 2008, Broadcom Corporation
# All Rights Reserved.
# 
# THIS SOFTWARE IS OFFERED "AS IS", AND BROADCOM GRANTS NO WARRANTIES OF ANY
# KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. BROADCOM
# SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
# FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
#
# $Id: Makefile,v 1.3 2008/08/13 20:20:16 Exp $
#

IGSSRCDIR := ../../../../../router/emf/igs
IGSCSRCDIR := ../../../../../emf/igs
EMFDIR := ../../../../../router/emf

IGS_OBJS := $(IGSCSRCDIR)/igsc.o $(IGSCSRCDIR)/igsc_sdb.o $(IGSSRCDIR)/igs_linux.o \
	    $(IGSCSRCDIR)/osl_linux.o

igs-objs := $(EMFDIR)/igs.o

obj-$(CONFIG_EMF) := igs.o

KERNELDIR := ../../../../../linux/linux-2.6
all:
	
clean:
	

clean-files += 
