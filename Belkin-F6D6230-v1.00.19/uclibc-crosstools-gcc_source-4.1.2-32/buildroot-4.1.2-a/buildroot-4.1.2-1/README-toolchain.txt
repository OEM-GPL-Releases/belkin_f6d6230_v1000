Install toolchain

1. System requirement: Fedora 8 or later (Linux OS) with Software Development package installed.

2. Make sure you have root privilege.

3. Extract file "uclibc-crosstools-gcc_source-4.1.2-32.tar.gz". 
	 #tar -xf uclibc-crosstools-gcc_source-4.1.2-32.tar.gz

4. Compile toolchain from source code.
   #cd buildroot-4.1.2-1
   #make

7. After make complete, new toolchain would be installed on "/opt/toolchains"




