Build Firmware

This document is compile guide for F6D6230.

1. System requirement: Fedora 8 or later (Linux OS) with Software Development package installed.

2. Before building the firmware, make sure the toolchain is ready.
3. Extract file "toolchain.tgz". 
Command is "tar -zxvf toolchain.tgz"

4. In the extracted folder "toolchain" there is a folder called "hndtools-mipsel-linux-uclibc-4.1.2-32"
Copy this folder "hndtools-mipsel-linux-uclibc-4.1.2-32" to /opt

5. cd /opt

6. Make a soft link "hndtools-mipsel-linux" to "hndtools-mipsel-linux-uclibc-4.1.2-32" 
Example "ln -s hndtools-mipsel-linux-uclibc-4.1.2-32 hndtools-mipsel-linux"

7. Use command "ls -al" to make sure the softlink is created.

3. Set correct path to toolchain.
Command is "export PATH=/opt/hndtools-mipsel-linux/bin:$PATH"
Use command "echo $PATH" to check if "/opt/hndtools-mipsel-linux/bin" has added to PATH.

4. Extract file "Belkin-F6DXXXX-vX.XX.XX.tgz" 
Command is "tar -zxvf Belkin-F6DXXXX-vX.XX.XX.tgz"

5. cd Belkin-F6DXXXX/src/router

6. Execute script file "F6DXXXX.sh" to build the firmware.
(Example: "./F6DXXXX.sh")

7. During firmware building, you will enter MENUCONFIG TWICE, do NOT change anything, just choose "Exit" and "Yes".

8. After build finish, firmware is locate at "Belkin-F6DXXXX/image/", file name is "linux-lzma.trx"
