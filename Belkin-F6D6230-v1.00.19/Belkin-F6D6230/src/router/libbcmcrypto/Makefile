
include $(TOP)/.config


# Find all ELF binaries (including extra libraries)
BINARIES := $(shell find $(TARGETDIR) -path $(TARGETDIR)/lib -prune -o -type f -print | file -f - | grep ELF | cut -d':' -f1)
MAP := .map
UNR := .unresolved
SYM := .symbols

all: 

install: all
	install -d $(INSTALLDIR)/usr/lib
	install -m 755 libbcmcrypto.so $(INSTALLDIR)/usr/lib
	$(STRIP) $(INSTALLDIR)/usr/lib/libbcmcrypto.so

clean:


# rule for removing unneeded symbols in the shared library
optimize: libbcmcrypto.so
	$(NM) -o --defined-only --no-sort libbcmcrypto.so | cut -d' ' -f3 > $(MAP)
	$(NM) --dynamic -u --no-sort $(BINARIES) | sort -u > $(UNR)
	rm -rf $(SYM)
	for symbol in `cat $(UNR)` ; do \
	if grep -q "^$${symbol}$$" $(MAP) ; then echo "-u $${symbol}" >> $(SYM) ;  \
	fi ; done
	# if no symbols are needed then delete the shared lib
	if ls $(SYM) ; then \
	$(AR) cr libbcmcrypto.a $(OBJS) ; \
	xargs -t $(LD) -shared -o libbcmcrypto.so libbcmcrypto.a < $(SYM) ; \
	install libbcmcrypto.so $(TARGETDIR)/usr/lib ; \
	$(STRIP) $(TARGETDIR)/usr/lib/libbcmcrypto.so ; \
	else \
	rm $(TARGETDIR)/usr/lib/libbcmcrypto.so ; fi
