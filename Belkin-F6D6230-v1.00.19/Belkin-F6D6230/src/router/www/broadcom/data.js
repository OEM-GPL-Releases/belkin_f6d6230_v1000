var tcp_proto = 6;
var udp_proto = 17;
var both_proto = 255;
var icmp_proto = 1;
var ADDRESS_MAP_NUMBER_PER_INTERFACE = 16;
var ADDRESS_MAP_TOTAL_COUNT = 16;
var VIRTUAL_SERVER_NUMBER_PER_INTERFACE = 20;
var VIRTUAL_SERVER_TOTAL_COUNT = 20;
var MAX_MAC_TABLE = 32;//wenfang 20070320 add for supporting wireless MAC address control
var DMZ_NUMBER_PER_INTERFACE = 16;
var DMZ_TOTAL_COUNT = 16;
var PORT_MAX = 2, IP_MAX = 1;
var MAX_PPPOE_SESSION = 4;
function PORT_RANGE()
{
	this.protocol = 0;
	this.b_port = 0;
	this.e_port = 0;
};
function IP_RANGE()
{
	this.ip = "";
	this.count = 0;
};
function Interface_T()
{
	this.ip = new Array(4);
	this.mask = new Array(4);
	this.gateway = new Array(4);

	var i;
	for(i=0; i<4; i++)
	{
		this.ip[i] = 0;
		this.mask[i] = 0;
		this.gateway[i] = 0;
	}
};
function IsSameNetwork(int1, int2)
{
	var i;
	if(int1.ip == 0 || int2.ip == 0) return false;
	for(i=0;i<4;i++)
		if( (int1.ip[i] & int1.mask[i]) != (int2.ip[i] & int2.mask[i]) ) return false;

	return true;
}
function isNValidIP(s) {
	if((isBlank(s))||(isNaN(s))||(isNValidInt(s))||(isNegInt(s))||(s<0||s>255))
		return true;
	else
		return false;
}
function getElementsByFieldName(target_form, field)
{
	var i;
	var form;
	var value;
	if(target_form == null || field == null) return -1;
	for(i=0; i<target_form.length; i++)
	{
		if(target_form.elements[i].name == field)		
			return i;
	}
	return -1;
}
function parseIP(strIP)
{
	var val1, val2, val3, val4;
	var IP = strIP.split(/\./);
	val1 = new Number(IP[0]);
	val2 = new Number(IP[1]);
	val3 = new Number(IP[2]);
	val4 = new Number(IP[3]);			
	return (val1.valueOf() + '.' + val2.valueOf() + '.' + val3.valueOf() + '.' + val4.valueOf() )
}
function IpToLong(addr) {
	var	IP;
	var val1, val2, val3, val4, longIP;
	IP = addr.split(/\./);
	val1 = new Number(IP[0]);
	val2 = new Number(IP[1]);
	val3 = new Number(IP[2]);
	val4 = new Number(IP[3]);
    longIP = val1 * 0x1000000 + val2 * 0x10000 + val3 * 0x100 + val4;
	return longIP;
}
function isValidMASK (addr)
{
    var sub_addr;
	data = addr.match(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
	if (!data || !addr) return false;

    if (addr.search(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) == -1)
        return false;
    sub_addr = addr.split(/\./);
    if(sub_addr.length != 4) return false;
    if (addr.lastIndexOf(".") == (addr.length-1))
		return false;
     	if(isNValidIP(sub_addr[0]) == true) return false;
    	if(isNValidIP(sub_addr[1]) == true) return false;
    	if(isNValidIP(sub_addr[2]) == true) return false;
    	if(isNValidIP(sub_addr[3]) == true) return false;
    return true;
} 

function isValidIP (addr)
{
    var sub_addr;
    var net_id;
    var host_id;
    
    if (addr.search(/^\d{1,3}\.\d{1,3}\.\d{1,3}\./) == -1)
        return false;
    sub_addr = addr.split(/\./);
    if(sub_addr.length < 4) return false;    
    if(sub_addr[3] == "*")
    	sub_addr[3] = "1";    
    else
    {
    	if(isNaN(sub_addr[3]) == true) return false;
    }

    if (sub_addr[0] > 0xff || sub_addr[1] > 0xff || sub_addr[2] > 0xff || sub_addr[3] > 0xff)
        return false;        

    if(sub_addr[0] < 128) 
    {
        if(sub_addr[0] == 0 || sub_addr[0] == 127)
            return false;
        host_id = sub_addr[1] * 0x10000 + sub_addr[2] * 0x100 + sub_addr[3] * 0x1;
        if(host_id == 0 || host_id == 0xffffff)
            return false;
    }
    else if(sub_addr[0] < 192) /* B class */
    {
        host_id = sub_addr[2] * 0x100 + sub_addr[3] * 0x1; 
        if(host_id == 0 || host_id == 0xffff)
            return false;           
    }
    else if(sub_addr[0] < 224) /* C class */
    {
        host_id = sub_addr[3] * 0x1;
        if(host_id == 0 || host_id == 0xff)
            return false;             
    }
    else
    {
        return false;                                         
    }
    
    return true;
}

function isValid_Zero_IP (addr)
{
    var sub_addr;
    var net_id;
    var host_id;
    if (addr.search(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/) == -1)
        return false;
    sub_addr = addr.split(/\./);        
    if (sub_addr[0] > 0xff || sub_addr[1] > 0xff || sub_addr[2] > 0xff || sub_addr[3] > 0xff)
        return false;        
	if(sub_addr[0] == 0 && sub_addr[1] == 0 && sub_addr[2] == 0 && sub_addr[3] == 0)
		return true;
    
    if(sub_addr[0] < 128) /* A class */
    {
        if(sub_addr[0] == 0 || sub_addr[0] == 127)
            return false;
        host_id = sub_addr[1] * 0x10000 + sub_addr[2] * 0x100 + sub_addr[3] * 0x1;
        if(host_id == 0 || host_id == 0xffffff)
            return false;
    }
    else if(sub_addr[0] < 192) /* B class */
    {
        host_id = sub_addr[2] * 0x100 + sub_addr[3] * 0x1; 
        if(host_id == 0 || host_id == 0xffff)
            return false;           
    }
    else if(sub_addr[0] < 224) /* C class */
    {
        host_id = sub_addr[3] * 0x1;
        if(host_id == 0 || host_id == 0xff)
            return false;             
    }
    else  /* Limit broadcast, Multicast net */
    {
        return false;                                         
    }
    
    return true;
}
function isNValidInt(s)
{
	var i, c;
	for (i=0; i<s.length; i++)	{
		c = s.charCodeAt(i);
		if ((c < 48) || (c > 57))
			return true;
	}
	return false;
}
/* mark by Lichen, 070830, do not allow the "00,11,22" format
function parseValueRange(value)
{
	var sub_value, range, sub_range;
	var i;
	var value1, value2;
	
	// check '*'
	if(value == null || value.length == 0) return null;
	if(value.length == 1)
	{
		if(value == '*')
		{
			range = new Array(1);			
			range[0] = new PORT_RANGE();
			range[0].b_port = 1;
			range[0].e_port = 65535;
			return range;
		}
	}
		
	sub_value = value.split(/\,/);
	range = new Array(sub_value.length);
	for(i=0; i < sub_value.length; i++)
	{
		range[i] = new PORT_RANGE();
		sub_range = sub_value[i].split(/\-/);
		if(sub_range.length == 1)
		{
			if(isNValidInt(sub_range[0]) == true) return null;
			range[i].b_port = range[i].e_port = sub_range[0];
		}
		else if(sub_range.length == 2)
		{
			if(isNValidInt(sub_range[0]) == false && sub_range[1] == '*')
			{
				value1 = new Number(sub_range[0]);
				range[i].b_port = sub_range[0];
				range[i].e_port = 65535;
			}
			else
			{
				if(isNValidInt(sub_range[0]) == true || isNValidInt(sub_range[1]) == true) return null;
				value1 = new Number(sub_range[0]);
				value2 = new Number(sub_range[1]);
				if(value1.valueOf() > value2.valueOf())
				{
					range[i].b_port = sub_range[1];
					range[i].e_port = sub_range[0];				
				}
				else
				{
					range[i].b_port = sub_range[0];
					range[i].e_port = sub_range[1];
				}
			}
		}
		else
			return null;
	}	
	return range;
}
*/
// added by Lichen, 070830, do not allow the "00,11,22" format
function parseValueRange(value)
{
	var sub_value, range, sub_range;
	var i;
	var value1, value2;
	
	// check '*'
	if(value == null || value.length == 0) return null;
	if(value.length == 1)
	{
		if(value == '*')
		{
			range = new Array(1);			
			range[0] = new PORT_RANGE();
			range[0].b_port = 1;
			range[0].e_port = 65535;
			return range;
		}
	}
		
	sub_value = value;
	range = new Array(1);
	range[0] = new PORT_RANGE();
	sub_range = sub_value.split(/\-/);
		if(sub_range.length == 1)
		{
			if(isNValidInt(sub_range[0]) == true) return null;
			range[0].b_port = range[0].e_port = sub_range[0];
		}
		else if(sub_range.length == 2)
		{
			if(isNValidInt(sub_range[0]) == false && sub_range[1] == '*')
			{
				value1 = new Number(sub_range[0]);
				range[0].b_port = sub_range[0];
				range[0].e_port = 65535;
			}
			else
			{
				if(isNValidInt(sub_range[0]) == true || isNValidInt(sub_range[1]) == true) return null;
				value1 = new Number(sub_range[0]);
				value2 = new Number(sub_range[1]);
				if(value1.valueOf() > value2.valueOf())
				{
					range[0].b_port = sub_range[1];
					range[0].e_port = sub_range[0];				
				}
				else
				{
					range[0].b_port = sub_range[0];
					range[0].e_port = sub_range[1];
				}
			}
		}
		else
			return null;
	return range;
}
function parsePortValueRange(value)
{
	var sub_value, range, sub_range;
	var i;
	var value1, value2;
	
	if(value == null || value.length == 0) return null;
	if(value.length == 1)
	{
		if(value == '*')
		{
			range = new Array(1);			
			range[0] = new PORT_RANGE();
			range[0].b_port = 1;
			range[0].e_port = 65535;
			return range;
		}
	}
		
	sub_value = value.split(/\,/);
	range = new Array(sub_value.length);
	for(i=0; i < sub_value.length; i++)
	{
		range[i] = new PORT_RANGE();
		sub_range = sub_value[i].split(/\-/);
		if(sub_range.length == 1)
		{
			if(isNaN(sub_range[0]) == true) return null;
			range[i].b_port = range[i].e_port = sub_range[0];
		}
		else if(sub_range.length == 2)
		{
			if(isNaN(sub_range[0]) == false && sub_range[1] == '*')
			{
				value1 = new Number(sub_range[0]);
				range[i].b_port = sub_range[0];
				range[i].e_port = 65535;
			}
			else
			{
				if(isNaN(sub_range[0]) == true || isNaN(sub_range[1]) == true) return null;
				value1 = new Number(sub_range[0]);
				value2 = new Number(sub_range[1]);
				range[i].b_port = sub_range[0];
				range[i].e_port = sub_range[1];
			}
		}
		else
			return null;
	}	
	return range;
}
function parseIPValueRange(value)
{
	var sub_value, range, sub_range;
	var i;
	var value1, value2;
	var sub_addr;	
	
	if(value == null || value.length == 0) return null;
	if(value.length == 1)
	{
		if(value == '*')
		{
			range = new Array(1);			
			range[0] = new IP_RANGE();
			range[0].ip = "0.0.0.0";
			range[0].count = 1;
			return range;
		}
		return null;		
	}
	
	sub_value = value.split(/\,/);
	range = new Array(sub_value.length);
	for(i=0; i < sub_value.length; i++)
	{
		range[i] = new IP_RANGE();
		sub_range = sub_value[i].split(/\-/);
		if(sub_range.length == 1)
		{  		
			if(isValidIP(sub_range[0]) == false) return null;
    		sub_addr = sub_range[0].split(/\./);
    		if(sub_addr[3] == "*")
    		{
    			sub_addr[3] = "1";
				range[i].ip = sub_addr[0] + "." + sub_addr[1] + "." + sub_addr[2] + "." + sub_addr[3];
				range[i].ip = parseIP(range[i].ip);
				range[i].count = 254;
    		}
    		else
    		{
				range[i].ip = sub_addr[0] + "." + sub_addr[1] + "." + sub_addr[2] + "." + sub_addr[3];
				range[i].ip = parseIP(range[i].ip);
				range[i].count = 1;    			
    		}
		}
		else if(sub_range.length == 2)
		{
			if(isValidIP(sub_range[0]) == false || isNaN(sub_range[1]) == true ) return null;
    		sub_addr = sub_range[0].split(/\./);
			value1 = new Number(sub_addr[3]);
			value2 = new Number(sub_range[1]);
			if(value1.valueOf() > value2.valueOf())
			{
				range[i].ip = sub_addr[0] + "." + sub_addr[1] + "." + sub_addr[2] + "." + value2.valueOf();
				range[i].count = value1.valueOf() - value2.valueOf() + 1;
			}
			else
			{
				range[i].ip = sub_addr[0] + "." + sub_addr[1] + "." + sub_addr[2] + "." + value1.valueOf();
				range[i].count = value2.valueOf() - value1.valueOf() + 1;
			}
		}
		else
			return null;
	}	
	return range;
}

function trueValueToInt(inValue) {
	if (inValue) 
		return 1;
	else 
		return 0;
}

function intValueToBool(inValue) {
	if (inValue == 0) 
		return false;
	else 
		return true;
}
