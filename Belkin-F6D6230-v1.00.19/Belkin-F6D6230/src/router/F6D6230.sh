# For AK Double N+ WG8116(F6D6230) compile 
#
#
echo "Building up the config files for AK F6D6230 Dobule N+ router(WG8116)"
rm -f .config
cp -f config/config.8116 .config
rm -f ../linux/linux-2.6/.config
cp -f ../linux/linux-2.6/config.8116 ../linux/linux-2.6/.config
make menuconfig
make
make install
cp -f mipsel-uclibc/linux.trx ../../image
cp -f mipsel-uclibc/linux-lzma.trx ../../image
