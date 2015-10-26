
CFLAGS += -I. -I$(TOP)/shared -I$(SRCBASE)/include -Wall -I$(LINUXDIR)/include -I$(TOP)/busybox-1.x -Wall -O
LDFLAGS	+= -L$(TOP)/nvram -L$(PLATFORMDIR)/install/nvram/usr/lib -lnvram -L$(TOP)/shared -L$(PLATFORMDIR)/install/shared/usr/lib -lshared \
	-L$(TOP)/libbcmcrypto -L$(INSTALLDIR)/libbcmcrypto/usr/lib -lbcmcrypto

install: all
	install -D UsbSMS $(INSTALLDIR)/usr/sbin/UsbSMS
	$(STRIP) $(INSTALLDIR)/usr/sbin/UsbSMS

all: 

clean:

