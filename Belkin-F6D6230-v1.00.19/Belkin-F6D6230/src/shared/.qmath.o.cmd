cmd_drivers/net/wl/wl_sta/../../../../../../shared/qmath.o := mipsel-linux-gcc -Wp,-MD,drivers/net/wl/wl_sta/../../../../../../shared/.qmath.o.d  -nostdinc -isystem /opt/toolchain/hndtools-mipsel-linux-uclibc-4.1.2-32/bin/../lib/gcc/mipsel-linux-uclibc/4.1.2/include -D__KERNEL__ -Iinclude  -include include/linux/autoconf.h -Wall -Wundef -Wstrict-prototypes -Wno-trigraphs -fno-strict-aliasing -fno-common -I../../include -DBCMINTERNAL -DBCMDBG -DBCMDRIVER -Dlinux -O2  -mabi=32 -G 0 -mno-abicalls -fno-pic -pipe -msoft-float -ggdb -ffreestanding  -march=mips32r2 -Wa,-mips32r2 -Wa,--trap  -Iinclude/asm-mips/mach-generic -fomit-frame-pointer  -fno-stack-protector -Wdeclaration-after-statement -Wno-pointer-sign -DDMA -DWLC_LOW -DWLC_HIGH -DSTA -DWET -DMAC_SPOOF -DIBSS_PEER_GROUP_KEY -DIBSS_PSK -DIBSS_PEER_MGMT -DIBSS_PEER_DISCOVERY_EVENT -DWLLED -DWME -DWLPIO -DWLAFTERBURNER -DCRAM -DWL11N -DWL11H -DWL11D -DDBAND -DWLRM -DWLCQ -DWLCNT -DDELTASTATS -DWLCOEX -DBCMSUP_PSK -DBCMWPA2 -DBCMDMA64 -DWLAMSDU -DWLAMSDU_SWDEAGG -DWLAMPDU -DBTC2WIRE -DWLTINYDUMP -O2 -Idrivers/net/wl/wl_sta -Idrivers/net/wl/wl_sta/.. -Idrivers/net/wl/wl_sta/../../../../../../wl/linux -Idrivers/net/wl/wl_sta/../../../../../../wl/sys -finline-limit=2048 -Werror  -DMODULE -mlong-calls -fno-common -D"KBUILD_STR(s)=\#s" -D"KBUILD_BASENAME=KBUILD_STR(qmath)"  -D"KBUILD_MODNAME=KBUILD_STR(wl_sta)" -c -o drivers/net/wl/wl_sta/../../../../../../shared/.tmp_qmath.o drivers/net/wl/wl_sta/../../../../../../shared/qmath.c

deps_drivers/net/wl/wl_sta/../../../../../../shared/qmath.o := \
  drivers/net/wl/wl_sta/../../../../../../shared/qmath.c \
  ../../include/qmath.h \
  ../../include/typedefs.h \
  include/linux/version.h \
  include/linux/types.h \
    $(wildcard include/config/uid16.h) \
    $(wildcard include/config/lbd.h) \
    $(wildcard include/config/lsf.h) \
    $(wildcard include/config/resources/64bit.h) \
  include/linux/posix_types.h \
  include/linux/stddef.h \
  include/linux/compiler.h \
    $(wildcard include/config/enable/must/check.h) \
  include/linux/compiler-gcc4.h \
    $(wildcard include/config/forced/inlining.h) \
  include/linux/compiler-gcc.h \
  include/asm/posix_types.h \
  include/asm/sgidefs.h \
  include/asm/types.h \
    $(wildcard include/config/highmem.h) \
    $(wildcard include/config/64bit/phys/addr.h) \
    $(wildcard include/config/64bit.h) \
  ../../include/bcmdefs.h \

drivers/net/wl/wl_sta/../../../../../../shared/qmath.o: $(deps_drivers/net/wl/wl_sta/../../../../../../shared/qmath.o)

$(deps_drivers/net/wl/wl_sta/../../../../../../shared/qmath.o):
