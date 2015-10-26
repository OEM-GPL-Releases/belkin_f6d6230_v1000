/*
 * Linux Broadcom BCM47xx GPIO char driver
 *
 * Copyright (C) 2008, Broadcom Corporation
 * All Rights Reserved.
 * 
 * THIS SOFTWARE IS OFFERED "AS IS", AND BROADCOM GRANTS NO WARRANTIES OF ANY
 * KIND, EXPRESS OR IMPLIED, BY STATUTE, COMMUNICATION OR OTHERWISE. BROADCOM
 * SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS
 * FOR A SPECIFIC PURPOSE OR NONINFRINGEMENT CONCERNING THIS SOFTWARE.
 * $Id: linux_gpio.c,v 1.10 2008/03/28 19:25:35 Exp $
 *
 */
#include <linux/module.h>
#include <linux/init.h>
#include <linux/fs.h>
#include <linux/miscdevice.h>
#include <asm/uaccess.h>

#include <typedefs.h>
#include <bcmutils.h>
#include <siutils.h>
#include <bcmdevs.h>
#include "../router/shared/arcadyan.h" // use for PROJECT_ID
#include <linux_gpio.h>

/* handle to the sb */
static si_t *gpio_sih;

/* major number assigned to the device and device handles */
static int gpio_major;
#if LINUX_VERSION_CODE >= KERNEL_VERSION(2, 6, 0)
static struct class *gpiodev_class = NULL;
#else
devfs_handle_t gpiodev_handle;
#endif

static int
gpio_open(struct inode *inode, struct file * file)
{
	MOD_INC_USE_COUNT;
	return 0;
}

static int
gpio_release(struct inode *inode, struct file * file)
{
	MOD_DEC_USE_COUNT;
	return 0;
}

static int
gpio_ioctl(struct inode *inode, struct file *file, unsigned int cmd, unsigned long arg)
{
	struct gpio_ioctl gpioioc;

	if (copy_from_user(&gpioioc, (struct gpio_ioctl *)arg, sizeof(struct gpio_ioctl)))
		return -EFAULT;

	switch (cmd) {
		case GPIO_IOC_RESERVE:
			gpioioc.val = si_gpioreserve(gpio_sih, gpioioc.mask, GPIO_APP_PRIORITY);
			break;
		case GPIO_IOC_RELEASE:
			/*
			 * releasing the gpio doesn't change the current
			 * value on the GPIO last write value
			 * persists till some one overwrites it
			 */
			gpioioc.val = si_gpiorelease(gpio_sih, gpioioc.mask, GPIO_APP_PRIORITY);
			break;
		case GPIO_IOC_OUT:
			gpioioc.val = si_gpioout(gpio_sih, gpioioc.mask, gpioioc.val,
			                         GPIO_APP_PRIORITY);
			break;
		case GPIO_IOC_OUTEN:
			gpioioc.val = si_gpioouten(gpio_sih, gpioioc.mask, gpioioc.val,
			                           GPIO_APP_PRIORITY);
			break;
		case GPIO_IOC_IN:
			gpioioc.val = si_gpioin(gpio_sih);
			break;
		default:
			break;
	}
	if (copy_to_user((struct gpio_ioctl *)arg, &gpioioc, sizeof(struct gpio_ioctl)))
		return -EFAULT;

	return 0;

}
static struct file_operations gpio_fops = {
	owner:		THIS_MODULE,
	open:		gpio_open,
	release:	gpio_release,
	ioctl:		gpio_ioctl
};

// chris ++
//#include <linux/timer.h>
extern long kernel_thread(int (*fn)(void *), void * arg, unsigned long flags);
//void init_timer(struct timer_list * timer);// 宣告struct timer_list 之後要呼叫這個function initialize
//void add_timer(struct timer_list * timer);//把timer list 加進來
//int del_timer(struct timer_list * timer);//最後不要用要delete
void Router_Led(int lighton);
void LED_timer_do(void);

//static int count = 0;
//static struct timer_list timer;
#if (PROJECT_ID!=0x8117)
static void Router_Led_SHCLK(int lighton)
{
	uint32 val;

	si_gpioouten(gpio_sih, ((uint32)1 <<1), ((uint32)1 << 1), GPIO_HI_PRIORITY);

	if (lighton == 1)
		val = ((uint32)1 << 1);
	else
		val = ((uint32)1 << 1) & (((uint32)~(1) << 1));

	si_gpioout(gpio_sih, ((uint32)1 << 1), val, GPIO_HI_PRIORITY);
}

static void Router_Led_DS(int lighton)
{
	uint32 val;

	si_gpioouten(gpio_sih, ((uint32)1 << 0), ((uint32)1 << 0), GPIO_HI_PRIORITY);

	if (lighton == 1)
		val = ((uint32)1 << 0);
	else
		val = ((uint32)1 << 0) & (((uint32)~(1) << 0));

	si_gpioout(gpio_sih, ((uint32)1 << 0), val, GPIO_HI_PRIORITY);
}

static void Router_Led_STRCLK(int lighton)
{
	uint32 val;

	si_gpioouten(gpio_sih, ((uint32)1 << 11), ((uint32)1 << 11), GPIO_HI_PRIORITY);

	if (lighton == 1)
		val = ((uint32)1 << 11);
	else
		val = ((uint32)1 << 11) & (((uint32)~(1) << 11));

	si_gpioout(gpio_sih, ((uint32)1 << 11), val, GPIO_HI_PRIORITY);
}

static void Init_Led(void) {
	Router_Led(1);
	si_gpioouten(gpio_sih, ((uint32)1 << 4), ((uint32)1 << 4), GPIO_HI_PRIORITY);
	si_gpioout(gpio_sih, ((uint32)1 << 4), ((uint32)1 << 4) & (((uint32)~(1) << 4)), GPIO_HI_PRIORITY);
	si_gpioouten(gpio_sih, ((uint32)1 << 15), ((uint32)1 << 15), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 15), ((uint32)1 << 15) & (((uint32)~(1) << 15)), GPIO_HI_PRIORITY);
}

void START_LED_STA1(void) {
	Router_Led(0);
	si_gpioouten(gpio_sih, ((uint32)1 << 15), ((uint32)1 << 15), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 15), ((uint32)1 << 15) & (((uint32)(1) << 15)), GPIO_HI_PRIORITY);
	si_gpioouten(gpio_sih, ((uint32)1 << 14), ((uint32)1 << 14), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 14), ((uint32)1 << 14) & (((uint32)~(1) << 14)), GPIO_HI_PRIORITY);
}

void START_LED_STA2(void) {
	Router_Led(1);
	si_gpioouten(gpio_sih, ((uint32)1 << 14), ((uint32)1 << 14), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 14), ((uint32)1 << 14) & (((uint32)(1) << 14)), GPIO_HI_PRIORITY);
	si_gpioouten(gpio_sih, ((uint32)1 << 13), ((uint32)1 << 13), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 13), ((uint32)1 << 13) & (((uint32)~(1) << 13)), GPIO_HI_PRIORITY);
}

void START_LED_STA3(void) {
	Router_Led(0);
	si_gpioouten(gpio_sih, ((uint32)1 << 13), ((uint32)1 << 13), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 13), ((uint32)1 << 13) & (((uint32)(1) << 13)), GPIO_HI_PRIORITY);
	si_gpioouten(gpio_sih, ((uint32)1 << 12), ((uint32)1 << 12), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 12), ((uint32)1 << 12) & (((uint32)~(1) << 12)), GPIO_HI_PRIORITY);
}

void START_LED_STA4(void) {
	Router_Led(1);
	si_gpioouten(gpio_sih, ((uint32)1 << 12), ((uint32)1 << 12), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 12), ((uint32)1 << 12) & (((uint32)(1) << 12)), GPIO_HI_PRIORITY);
	si_gpioouten(gpio_sih, ((uint32)1 << 9), ((uint32)1 << 9), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 9), ((uint32)1 << 9) & (((uint32)~(1) << 9)), GPIO_HI_PRIORITY);
}

void START_LED_STA5(void) {
	Router_Led(0);
	si_gpioouten(gpio_sih, ((uint32)1 << 9), ((uint32)1 << 9), GPIO_HI_PRIORITY);	//chris ++
	si_gpioout(gpio_sih, ((uint32)1 << 9), ((uint32)1 << 9) & (((uint32)(1) << 9)), GPIO_HI_PRIORITY);
}
#endif

extern void msleep(unsigned int msecs);

void Router_Led(int lighton)
{
	int i;

#if (PROJECT_ID==0x8117)
	for(i=0; i<=63; i++)
	{
		si_gpioouten(gpio_sih, ((uint32)1 << 10), ((uint32)1 << 10), GPIO_HI_PRIORITY);
		si_gpioout(gpio_sih, ((uint32)1 << 10), ((uint32)1 << 10) & (((uint32)~(i%2) << 10)), GPIO_HI_PRIORITY);
		msleep(300);
	}
#else
	for(i=0; i<=31; i++)
	{
		switch( i )
		{
		case 0:	// BASE state, all clocks are down
			Router_Led_STRCLK(0);
			Router_Led_SHCLK(0);
			Router_Led_DS(0);
			break;

		case 1:	// 74HC595-2 Q5 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;
			
			
		case 2:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;

		case 3:	// 74HC595-2 Q4 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;
			
			
		case 4:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;


		case 5:	// 74HC595-2 Q3 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;
			
			
		case 6:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;

		case 7:	// 74HC595-2 Q2 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;
			
			
		case 8:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;

		case 9:	// 74HC595-2 Q1 then shift clock up
			if (lighton)
				Router_Led_DS(0);
			else
				Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;
			
			
		case 10:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;
						
		case 11:	// 74HC595-2 Q0 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;
			
			
		case 12:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;


		case 13:	// 74HC595-1 Q7 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;
			
		case 14:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;


		case 15:	// 74HC595-1 Q6 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;

		case 16:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;


		case 17:	// 74HC595-1 Q5 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;

		case 18:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;


		case 19:	// 74HC595-1 Q4 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;

		case 20:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;
		
		case 21:	// 74HC595-1 Q3 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;

		case 22:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;

		case 23:	// 74HC595-1 Q2 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;

		case 24:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;	

		case 25:	// 74HC595-1 Q1 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;

		case 26:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;	

		case 27:	// 74HC595-1 Q0 then shift clock up
			Router_Led_DS(1);
			msleep(2);
			Router_Led_SHCLK(1);
			break;

		case 28:	// clock & data down
			Router_Led_DS(0);
			Router_Led_SHCLK(0);
			break;


		case 29:	 // output up
			Router_Led_STRCLK(1);
			break;

		case 30: // output down
			Router_Led_STRCLK(0);
			break;

		case 31:	// idle state again
			Router_Led_DS(0);
			Router_Led_STRCLK(0);
			Router_Led_SHCLK(0);
			break;

		default:
			break;
		}	// switch-case
	msleep(6);
	
	} // for
#endif
}

/*	// give up add_timer
void LED_timer(void)
{
    timer.expires = jiffies + 1000;
    timer.function = LED_timer_do;
	printk("%s %d\n", __FUNCTION__, __LINE__);
    add_timer(&timer);
	printk("%s %d\n", __FUNCTION__, __LINE__);
}
*/

void LED_timer_do(void)
{
/*	printk("%s %d\n", __FUNCTION__, __LINE__);
    init_timer(&timer);
    timer.expires = jiffies + 1000;
    add_timer(&timer);
    printk("justin\n");
    count ++;
    if(count > 7)
        del_timer(&timer);*/
#if (PROJECT_ID!=0x8117)
    Init_Led();
    START_LED_STA1();
    START_LED_STA2();
    START_LED_STA3();
    START_LED_STA4();
    START_LED_STA5();
    Router_Led(1);
#endif
	Router_Led(1);
}
// chris --

static int __init
gpio_init(void)
{
	if (!(gpio_sih = si_kattach(SI_OSH)))
		return -ENODEV;

#if LINUX_VERSION_CODE >= KERNEL_VERSION(2, 6, 0)
	if ((gpio_major = register_chrdev(0, "gpio", &gpio_fops)) < 0)
#else
	if ((gpio_major = devfs_register_chrdev(0, "gpio", &gpio_fops)) < 0)
#endif
		return gpio_major;
#if LINUX_VERSION_CODE >= KERNEL_VERSION(2, 6, 0)
	gpiodev_class = class_create(THIS_MODULE, "gpio");
	if (IS_ERR(gpiodev_class)) {
		printk("Error creating gpio class\n");
		return -1;
	}

	/* Add the device gpio0 */
	class_device_create(gpiodev_class, NULL, MKDEV(gpio_major, 0), NULL, "gpio");
#else
	gpiodev_handle = devfs_register(NULL, "gpio", DEVFS_FL_DEFAULT,
	                                gpio_major, 0, S_IFCHR | S_IRUGO | S_IWUGO,
	                                &gpio_fops, NULL);
#endif

// chris ++
	printk("%s %d\n", __FUNCTION__, __LINE__);
	kernel_thread(LED_timer_do, NULL, SIGCHLD | CLONE_KERNEL);
    //timer.expires = jiffies + 1000;
    //timer.function = LED_timer_do;
//	printk("%s %d\n", __FUNCTION__, __LINE__);
//    add_timer(&timer);
//	printk("%s %d\n", __FUNCTION__, __LINE__);
// chris --

	return 0;
}

static void __exit
gpio_exit(void)
{
#if LINUX_VERSION_CODE >= KERNEL_VERSION(2, 6, 0)
	if (gpiodev_class != NULL) {
		class_device_destroy(gpiodev_class, MKDEV(gpio_major, 0));
		class_destroy(gpiodev_class);
	}

	gpiodev_class = NULL;
	if (gpio_major >= 0)
		unregister_chrdev(gpio_major, "gpio");
#else
	if (gpiodev_handle != NULL)
		devfs_unregister(gpiodev_handle);
	gpiodev_handle = NULL;
	devfs_unregister_chrdev(gpio_major, "gpio");
#endif
	si_detach(gpio_sih);
}

module_init(gpio_init);
module_exit(gpio_exit);
