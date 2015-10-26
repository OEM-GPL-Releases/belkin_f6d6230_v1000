var RESTRICTION_ALLOW =	0;
var RESTRICTION_DENY =	1;
var ENABLE =				1;
var DISABLE =				0;
var TCP = 					0;
var UDP =					1;
var TCP_OR_UDP =			2;
var ICMP =					3;
var IGMP =					4;
var NONE =					5;
var USER_DEFINED =		14;
var GUEST_SSID_INDEX = 	1000;
var DAY_NONE = 0;
var TIME_NONE = 1;
var MINUTE_INTERVAL =	5;
var MEMBER_NUM_MAX =		20;
var debug = false;
//==============================================================================
function CEntry(host, mac, ip, bAdd)
{
	this.host = host;
	this.mac = mac;
	this.ip = ip;
	this.isAdded = bAdd;
};

function CList()
{
	return{
		length: 0,
		entry: [],
		
		AddEntry: function(host, mac, ip, bAdd)
		{
			this.entry[this.length] = new CEntry(host, mac, ip, bAdd);
			this.length++;
		}
	};
};
//==============================================================================
function ConnectedCList()
{
	this.d_list = new CList();	// dynamic client list
	this.s_list = new CList();	// static client list
	this.g_entry = new CEntry(va_js01, "", "", false);	// guest ssid entry
	this.FindEntryByMac = function(mac)
	{
		for(var i=0;i<this.d_list.length;i++)
		{
			if(this.d_list.entry[i].mac == mac) return this.d_list.entry[i];
		}
		for(var i=0;i<this.s_list.length;i++)
		{
			if(this.s_list.entry[i].mac == mac) return this.s_list.entry[i];
		}
		if(mac == "00-00-00-00-00-00")
			return this.g_entry;
		
		return null;	
	}
};
//==============================================================================
function BlockedService()
{
	this.service = 0;
	this.portProtocol1 = NONE;
	this.portString1 = "";
	this.portProtocol2 = NONE;
	this.portString2 = "";
}
//==============================================================================
function MEntry(host, mac, status, rest, ref, sche)
{
	this.host = host;
	this.mac = mac;
	this.status = status;
	this.rest = rest;
	this.refEntry = ref;
	this.everyday = 1;
	this.sun = 1;
	this.mon = 1;
	this.tue = 1;
	this.wed = 1;
	this.thu = 1;
	this.fri = 1;
	this.sat = 1;
	this.hour24 = 1;
	this.startHour = 0;
	this.startMinute = 0;
	this.endHour = 23;
	this.endMinute = 11;
	if(sche!=undefined)
	{
		var sArray = sche.split(":");
		if(sArray[0] == "1111111")
			this.everyday = 1;
		else
			this.everyday = 0;
		this.sun = sArray[0].charAt(0);
		this.mon = sArray[0].charAt(1);
		this.tue = sArray[0].charAt(2);
		this.wed = sArray[0].charAt(3);
		this.thu = sArray[0].charAt(4);
		this.fri = sArray[0].charAt(5);
		this.sat = sArray[0].charAt(6);
		if(sArray[1] == "0" && sArray[2] == "0" && sArray[3] == "0" && sArray[4] == "23" && sArray[5] == "59" && sArray[6] == "59")
			this.hour24 = 1;
		else
			this.hour24 = 0;
		this.startHour = sArray[1];
		this.startMinute = sArray[2]/MINUTE_INTERVAL;
		this.endHour = sArray[4];
		this.endMinute = sArray[5]/MINUTE_INTERVAL;
	}
	this.services = new Array(5);
	this.services[0] = new BlockedService();
	this.services[1] = new BlockedService();
	this.services[2] = new BlockedService();
	this.services[3] = new BlockedService();
	this.services[4] = new BlockedService();
	this.urls = new Array(4);
	for(var i=0;i<4;i++) this.urls[i] = "";
	this.keywords = new Array(6);
	for(var i=0;i<6;i++) this.keywords[i] = "";
};
//==============================================================================
function MemberList()
{
	return{
		length: 0,
		entry: [],
		guest_entry: new MEntry("", "", ENABLE, RESTRICTION_DENY, null),
		cc_list: null,
		
		SetCCList: function(list)
		{
			this.cc_list = list;	
		},
		
		AddEntry: function(host, mac, option, sche)
		{
			var ref = this.cc_list.FindEntryByMac(mac);
			var status = ENABLE;
			var rest = RESTRICTION_DENY;
			var day1 = DAY_NONE;
			var e;
			
			if(option != undefined && option["status"] != undefined) status = option["status"];
			if(option != undefined && option["rest"] != undefined) rest = option["rest"];
			if(option != undefined && option["ref"] != undefined) ref = option["ref"];
			if(mac == "00-00-00-00-00-00") // member from guest ssid
			{
				this.guest_entry = new MEntry(va_js01, "", status, rest, ref, sche);
				e = this.guest_entry;
			}
			else
			{
				this.entry[this.length] = new MEntry(host, mac, status, rest, ref, sche);
				e = this.entry[this.length];
				this.length++;
			}
			
			for(var i=0;i<4;i++)
				if(option != undefined && option["u"+(i+1)] != undefined) e.urls[i] = option["u"+(i+1)];
			for(var i=0;i<6;i++)
				if(option != undefined && option["k"+(i+1)] != undefined) e.keywords[i] = option["k"+(i+1)];
			for(var i=0;i<5;i++)
			{
				var protocol = NONE;
				var port = "";
				if(option != undefined && option["pc"+(i+1)] != undefined) protocol = option["pc"+(i+1)];
				switch(protocol)
				{
					case 6: protocol = TCP; break;
					case 17: protocol = UDP; break;
					case 254: protocol = TCP_OR_UDP; break;
					case 1: protocol = ICMP; break;
					case 2: protocol = IGMP; break;
					case 0: protocol = NONE; break;	
				}
				if(option != undefined && option["pr"+(i+1)] != undefined) port = option["pr"+(i+1)];
				e.services[i].portProtocol1 = protocol;
				e.services[i].portString1 = port;
				if(protocol == NONE)
					e.services[i].service = 0;
				else if(protocol == TCP_OR_UDP && port == "53-53")
					e.services[i].service = 1;
				else if(protocol == ICMP)
					e.services[i].service = 2;
				else if(protocol == TCP && port == "80-80")
					e.services[i].service = 3;
				else if(protocol == TCP && port == "443-443")
					e.services[i].service = 4;
				else if(protocol == TCP && port == "20-21")
					e.services[i].service = 5;
				else if(protocol == TCP && port == "110-110")
					e.services[i].service = 6;
				else if(protocol == TCP && port == "143-143")
					e.services[i].service = 7;
				else if(protocol == TCP && port == "25-25")
					e.services[i].service = 8;
				else if(protocol == TCP && port == "119-119")
					e.services[i].service = 9;
				else if(protocol == TCP && port == "23-23")
					e.services[i].service = 10;
				else if(protocol == TCP_OR_UDP && port == "161-161")
					e.services[i].service = 11;
				else if(protocol == TCP_OR_UDP && port == "69-69")
					e.services[i].service = 12;
				else if(protocol == TCP_OR_UDP && port == "500-500")
					e.services[i].service = 13;
				else
					e.services[i].service = 14;
			}
			if(ref != null)
				ref.isAdded = true;
		},
		
		DelEntry: function(index)
		{
			if(this.entry[index].refEntry != null)
				this.entry[index].refEntry.isAdded = false;
			
			for(var i=index;i<this.length-1;i++)
			{
				//this.entry[i] = eval(uneval(this.entry[i+1])); //swap for FireFox only
				var d = this.entry[i];
				var s = this.entry[i+1];
				for (var j in s) {
					d[j] = s[j];
				}
			}
			delete this.entry[this.length-1];
			this.length--;
		},

		UpdateGuestEntry: function(host, mac, ref)
		{
			this.guest_entry.host = host;
			this.guest_entry.mac = mac;
			this.guest_entry.refEntry = ref;
			ref.isAdded = true;
		},
		
		DelGuestEntry: function()
		{
			this.guest_entry.host = "";
			this.guest_entry.mac = "";
			this.guest_entry.refEntry.isAdded = false;
		}
	};
};

//==============================================================================
// Global Variables
var cc_list = new ConnectedCList();
var m_list = new MemberList();
m_list.SetCCList(cc_list);
var cur_member = -1;
//==============================================================================
// for testing
if(debug)
{
	cc_list.d_list.AddEntry("PC 1", "00-12-BF-00-00-01", "192.168.2.11");
	cc_list.d_list.AddEntry("PC 2", "00-12-BF-00-00-02", "192.168.2.12");
	cc_list.d_list.AddEntry("PC 3", "00-12-BF-00-00-03", "192.168.2.13");
	cc_list.d_list.AddEntry("PC 4", "00-12-BF-00-00-04", "192.168.2.14");
	cc_list.d_list.AddEntry("PC 5", "00-12-BF-00-00-05", "192.168.2.15");
	cc_list.d_list.AddEntry("PC 6", "00-12-BF-00-00-06", "192.168.2.16");
	cc_list.d_list.AddEntry("PC 7", "00-12-BF-00-00-07", "192.168.2.17");
	cc_list.d_list.AddEntry("PC 8", "00-12-BF-00-00-08", "192.168.2.18");
	cc_list.d_list.AddEntry("PC 9", "00-12-BF-00-00-09", "192.168.2.19");
	cc_list.d_list.AddEntry("PC 10", "00-12-BF-00-00-10", "192.168.2.20");
	
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-01", "192.168.2.31");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-02", "192.168.2.32");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-03", "192.168.2.33");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-04", "192.168.2.34");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-05", "192.168.2.35");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-06", "192.168.2.36");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-07", "192.168.2.37");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-08", "192.168.2.38");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-09", "192.168.2.39");
	cc_list.s_list.AddEntry("", "00-12-BF-00-01-10", "192.168.2.40");
}
//==============================================================================

function RefreshCCListTable(tb_id)
{
	var AddRow = function(t, entry, type, index)
	{
		var r = t.insertRow(-1);
		var c = r.insertCell(-1);
		c.innerHTML = entry.host;
		c = r.insertCell(-1);
		c.innerHTML = entry.ip;
		c = r.insertCell(-1);
		c.innerHTML = entry.mac;
		c = r.insertCell(-1);
		if(entry.isAdded)
			c.innerHTML = va_js02;
		else
			c.innerHTML = "<input type='button' class='submitBtn' value=" + va_js03 + " onclick='AddMember(" + type + "," + index + ")'>";
	};
	
	var t = document.getElementById(tb_id);
	for(var i=t.rows.length-1;i>0;i--)
		t.deleteRow(i);
	for(var i=0;i<cc_list.d_list.length;i++)
	{
		AddRow(t, cc_list.d_list.entry[i], 1, i);
	}
	for(var i=0;i<cc_list.s_list.length;i++)
	{
		AddRow(t, cc_list.s_list.entry[i], 2, i);
	}
	AddRow(t, cc_list.g_entry, 3, 0);
	
	var r = t.insertRow(-1);
	var c = r.insertCell(-1);
	//c.innerHTML = "<input type='text' name='ccl_host'>";
	c = r.insertCell(-1);
	c = r.insertCell(-1);
	c.className = "mac_panel";
	c.innerHTML = "<input type='text' name='ccl_mac_0' maxlength=2>-<input type='text' name='ccl_mac_1' maxlength=2>-<input type='text' name='ccl_mac_2' maxlength=2>-" +
						"<input type='text' name='ccl_mac_3' maxlength=2>-<input type='text' name='ccl_mac_4' maxlength=2>-<input type='text' name='ccl_mac_5' maxlength=2>";
	c = r.insertCell(-1);
	c.innerHTML = "<input type='button' class='submitBtn' value=" + va_js03 + " onclick='AddMember()'>";
}
//==============================================================================
function AddMember(type, index)
{
	if(type)
	{
		switch(type)
		{
			case 1:
				m_list.AddEntry(cc_list.d_list.entry[index].host, cc_list.d_list.entry[index].mac, {ref:cc_list.d_list.entry[index]});
				ShowMemberInfo(m_list.length-1);
				break;
			case 2:
				m_list.AddEntry(cc_list.s_list.entry[index].host, cc_list.s_list.entry[index].mac, {ref:cc_list.s_list.entry[index]});
				ShowMemberInfo(m_list.length-1);
				break;
			case 3:
				//m_list.AddEntry(cc_list.g_entry.host, cc_list.g_entry.mac, cc_list.g_entry);
				m_list.UpdateGuestEntry(cc_list.g_entry.host, cc_list.g_entry.mac, cc_list.g_entry);
				ShowMemberInfo(GUEST_SSID_INDEX);
				break;
		}
	}
	else
	{
		var f = document.tF;
		var macUsed = f["ccl_mac_0"].value + ":" + 
						  f["ccl_mac_1"].value + ":" +
						  f["ccl_mac_2"].value + ":" +
						  f["ccl_mac_3"].value + ":" +
						  f["ccl_mac_4"].value + ":" +
						  f["ccl_mac_5"].value;
						  
		var macAddr= f["ccl_mac_0"].value + "-" + 
						  f["ccl_mac_1"].value + "-" +
						  f["ccl_mac_2"].value + "-" +
						  f["ccl_mac_3"].value + "-" +
						  f["ccl_mac_4"].value + "-" +
						  f["ccl_mac_5"].value;
						  
		if ( isValidMacAddress( macUsed ) == false ) {
			alert( macaddresserror+":"+macUsed+"."+rc);
			return;
		}
		
		for(var i=0; i<m_list.length; i++) {
			if(macAddr.toUpperCase()==m_list.entry[i].mac.toUpperCase()) {
				alert(exist_mList);
				return;
			}
		}
		
		for(var i=0; i<dhcp_count; i++) {
			if(macAddr.toUpperCase()==dcList[i].mac.toUpperCase()) {
				alert(exist_cList);
				return;
			}
		}
		
		for(var i=0; i<static_count; i++) {
			if(macAddr.toUpperCase()==scList[i].mac.toUpperCase()) {
				alert(exist_cList);
				return;
			}
		}
						
		
		m_list.AddEntry("", document.tF.ccl_mac_0.value+"-"+document.tF.ccl_mac_1.value+"-"+document.tF.ccl_mac_2.value+"-"+document.tF.ccl_mac_3.value+"-"+document.tF.ccl_mac_4.value+"-"+document.tF.ccl_mac_5.value);
		ShowMemberInfo(m_list.length-1);
	}
	RefreshCCListTable("cclist_table");
	RefreshMemberTable("member_table");
	HideClientListPanel();
}
//==============================================================================
function DelMember(index)
{
	if(index == GUEST_SSID_INDEX)
	{
		if(!confirm(va_js11 + " " + (m_list.length+1) +"?"))
			return;
		
		m_list.DelGuestEntry();
	}
	else
	{
		if(!confirm(va_js11 + " " + (index+1) +"?"))
			return;
		
		m_list.DelEntry(index);
	}
	
	ShowE("member_panel", "none");
	cur_member = -1;
	RefreshCCListTable("cclist_table");
	RefreshMemberTable("member_table");
}
//==============================================================================
function RefreshMemberTable(tb_id)
{
	var AddRow = function(t, host, mac, status, rest, index)
	{
		var chk1 = "";
		var chk2 = "";
		var r = t.insertRow(-1);
		var c = r.insertCell(-1);
		var display_index = index + 1;
		if(index == GUEST_SSID_INDEX) display_index = m_list.length+1;
		c.style.width = "65px";
		c.innerHTML = "<input type='button' class='submitBtn' style='width:100%' value='" + display_index + "'>"
		addEvent(c, "click", function(){
			ShowMemberInfo(index);
		});
		
		c = r.insertCell(-1);
		c.innerHTML = host;
		
		c = r.insertCell(-1);
		c.style.width = "140px";
		c.innerHTML = mac;
		
		c = r.insertCell(-1);
		c.style.width = "150px";
		if(status == ENABLE)
			chk1 = "checked ";
		else
			chk2 = "checked ";
		c.innerHTML =	"<input type='radio' " + chk1 + "name='status_" + index + "' onclick='SetStatus(" + index + ")'><label>"+va_js04+"</label>" + 
							"<input type='radio' " + chk2 + "name='status_" + index + "' onclick='SetStatus(" + index + ")'><label>"+va_js05+"</label>";
		
		chk1 = "";
		chk2 = "";
		c = r.insertCell(-1);
		c.style.width = "150px";
		if(rest == RESTRICTION_DENY)
			chk1 = "checked ";
		else
			chk2 = "checked ";
		c.innerHTML =	"<input type='radio' " + chk2 + "name='rest_" + index + "' onclick='SetRest(" + index + ")'><label>"+va_js07+"</label>" +
							"<input type='radio' " + chk1 + "name='rest_" + index + "' onclick='SetRest(" + index + ")'><label>"+va_js06+"</label>";
		
		c = r.insertCell(-1);
		c.style.width = "60px";
		c.innerHTML = "<input type='button' class='submitBtn' style='width:100%' value='"+va_js08+"' onclick='DelMember(" + index + ")'>";
	};
	
	var t = document.getElementById(tb_id);
	for(var i=t.rows.length-1;i>=0;i--)
		t.deleteRow(i);
	for(var i=0;i<m_list.length;i++)
	{
		AddRow(t, m_list.entry[i].host, m_list.entry[i].mac, m_list.entry[i].status, m_list.entry[i].rest, i);
	}
	
	if(m_list.guest_entry.host != "")
	{
		AddRow(t, m_list.guest_entry.host, m_list.guest_entry.mac, m_list.guest_entry.status, m_list.guest_entry.rest, GUEST_SSID_INDEX);
	}
	
	if(t.rows.length >= 10)
		document.getElementById("member_info_panel").style.height = "261px";
	else
		document.getElementById("member_info_panel").style.height = 1+26*t.rows.length+"px";
	
	if(t.rows.length < MEMBER_NUM_MAX)
	{
		ShowE("add_btn_table", "");
	}
	else
	{
		ShowE("add_btn_table", "none");
	}
}
//==============================================================================
var service_type = new Array();
service_type[0] = va_blsrv1;
service_type[1] = vz_dns;
service_type[2] = vz_ping;
service_type[3] = vz_http;
service_type[4] = vz_https;
service_type[5] = vz_ftp;
service_type[6] = vz_pop3;
service_type[7] = vz_imap;
service_type[8] = vz_smtp;
service_type[9] = vz_nntp;
service_type[10] = vz_telnet;
service_type[11] = vz_snmp;
service_type[12] = vz_tftp;
service_type[13] = vz_ike;
service_type[14] = va_blsrv2;

var service_port = new Array();
service_port[0] = "TCP";
service_port[1] = "UDP";
service_port[2] = "TCP & UDP";
service_port[3] = "ICMP";
service_port[4] = "IGMP";
service_port[5] = va_js09;

var hour_interval = [
	"00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11",
	"12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"
];

var minute_interval = [
	"00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"
];

var service_info = [
	NONE,				"",		NONE, "",	//None
	TCP_OR_UDP,	"53",		NONE, "",	//DNS
	ICMP,				"",		NONE, "",	//PING
	TCP,				"80",		NONE, "",	//HTTP
	TCP,				"443",	NONE, "",	//HTTPS
	TCP,				"20-21",	NONE, "",	//FTP
	TCP,				"110",	NONE, "",	//POP3
	TCP,				"143",	NONE, "",	//IMAP
	TCP,				"25",		NONE, "",	//SMTP
	TCP,				"119",	NONE, "",	//NNTP
	TCP,				"23",		NONE, "",	//TELNET
	TCP_OR_UDP,	"161",	NONE, "",	//SNMP
	TCP_OR_UDP,	"69",		NONE, "",	//TFTP
	TCP_OR_UDP,	"500",	NONE, "",	//IKE
	NONE,				"",		NONE, "",	//user defined
];

addEvent(window, 'load', Init);
if (navigator.appVersion.indexOf("MSIE 5.5") >= 0 || navigator.appVersion.indexOf("MSIE 6.0") >= 0 || navigator.appVersion.indexOf("MSIE 7.0") >= 0)
{
	addEvent(window, 'load', ReloadSelectElement);
}

var cur_submit_idx;
var myTabs1;
//==============================================================================
function Init()
{
	myTabs1 = new mootabs('myTabs', {height: '250px', width: '690px'});
	ShowE("member_panel", "none");
	
	for(var i=0;i<50;i++)
		if(dcList[i])
			cc_list.d_list.AddEntry(dcList[i].host, dcList[i].mac, dcList[i].ip, dcList[i].isAdded);
	
	for(var i=0;i<50;i++)
		if(scList[i])
			cc_list.s_list.AddEntry("", scList[i].mac, scList[i].ip, scList[i].isAdded);
	
	initMemberList();
	RefreshCCListTable("cclist_table");
	RefreshMemberTable("member_table");
	InitBlockedServicePanel();
	InitSchedulePanel();
	BlockAllClickCheck(true);
	CheckTimeDisable();
	CheckScheduleRange();
	for(var i=0;i<5;i++)
		CheckService(i);
	
	initAccessControlEnable();
}

function ShowHideMemberTable()
{
	if(document.tF.ac_enable[0].checked)
	{
		document.getElementById("member_tr").style.display = "";
		document.getElementById("content_tr").style.display = "";
	}
	else
	{
		document.getElementById("member_tr").style.display = "none";
		document.getElementById("content_tr").style.display = "none";
	}
}

function AddOptions(s, data)
{
	s = document.tF[s];
	s.options.length = data.length;
	for(var i=0;i<data.length;i++)
	{
		s.options[i] = new Option(data[i], i);
	}
}

function InitBlockedServicePanel()
{
	for(var i=0;i<5;i++)
		AddOptions("blocked_service_"+i, service_type);
	
	for(var i=0;i<5;i++)
	AddOptions("svc_type_"+(i*2), service_port);

}

function InitSchedulePanel()
{
	AddOptions("starthour", hour_interval);
	AddOptions("startminute", minute_interval);
	AddOptions("endhour", hour_interval);
	AddOptions("endminute", minute_interval);
}

function ShowClientListPanel()
{
	document.tF.starthour.style.display = "none";
	document.tF.startminute.style.display = "none";
	document.tF.endhour.style.display = "none";
	document.tF.endminute.style.display = "none";
	document.tF.blocked_service_0.style.display = "none";
	document.tF.blocked_service_1.style.display = "none";
	document.tF.blocked_service_2.style.display = "none";
	document.tF.blocked_service_3.style.display = "none";
	document.tF.blocked_service_4.style.display = "none";
	document.tF.svc_type_0.style.display = "none";
	document.tF.svc_type_2.style.display = "none";
	document.tF.svc_type_4.style.display = "none";
	document.tF.svc_type_6.style.display = "none";
	document.tF.svc_type_8.style.display = "none";
	
	document.getElementById("popup_base").style.visibility = "visible";
	document.getElementById("client_list_panel").style.display = "block";
}

function HideClientListPanel()
{
	document.tF.starthour.style.display = "";
	document.tF.startminute.style.display = "";
	document.tF.endhour.style.display = "";
	document.tF.endminute.style.display = "";
	document.tF.blocked_service_0.style.display = "";
	document.tF.blocked_service_1.style.display = "";
	document.tF.blocked_service_2.style.display = "";
	document.tF.blocked_service_3.style.display = "";
	document.tF.blocked_service_4.style.display = "";
	document.tF.svc_type_0.style.display = "";
	document.tF.svc_type_2.style.display = "";
	document.tF.svc_type_4.style.display = "";
	document.tF.svc_type_6.style.display = "";
	document.tF.svc_type_8.style.display = "";
	
	document.getElementById("popup_base").style.visibility = "hidden";
	document.getElementById("client_list_panel").style.display = "none";
}

function ShowMemberInfo(index)
{
	SaveMember(cur_member);
	LoadMember(index);
	cur_member = index;
	ShowE("member_panel", "block");
	if(index == GUEST_SSID_INDEX) index = m_list.length;
	document.getElementById("member_label").innerHTML = va_js10 + " " + (index+1);
	
	myTabs1.activate("Schedule");
}

function ShowE(sDivID, bState)
{
	var oDiv = document.getElementById(sDivID);
	oDiv.style.display = bState;
}

function CheckService(index)
{
	var i = document.tF["blocked_service_"+index].value;
	if(i == USER_DEFINED)
	{
		document.tF["svc_type_"+index*2].selectedIndex=
		document.tF["svc_type_"+(index*2)].value;
		
		document.tF["svc_type_"+index*2].disabled = false;
		//document.tF["svc_type_"+(index*2+1)].disabled = false;
		document.tF["port_range_"+index*2].disabled = false;
		//document.tF["port_range_"+(index*2+1)].disabled = false;		
	}	
	else
	{
		document.tF["svc_type_"+index*2].selectedIndex = service_info[i*4+0];
		document.tF["port_range_"+index*2].value = service_info[i*4+1];
		//document.tF["svc_type_"+(index*2+1)].selectedIndex = service_info[i*4+2];
		//document.tF["port_range_"+(index*2+1)].value = service_info[i*4+3];
		
		document.tF["svc_type_"+index*2].disabled = true;
		//document.tF["svc_type_"+(index*2+1)].disabled = true;
		document.tF["port_range_"+index*2].disabled = true;
		//document.tF["port_range_"+(index*2+1)].disabled = true;		
	}
	
	CheckPortRange(index*2);
	//CheckPortRange(index*2+1);
}

function CheckPortRange(index)
{
	var i = document.tF["svc_type_"+index].value;
	if(i == NONE || i == ICMP || i == IGMP)
	{
		document.tF["port_range_"+index].value = "";
		document.tF["port_range_"+index].disabled = true;
		if(i == NONE)
			document.tF["blocked_service_"+(index/2)].value = 0; //NONE
		else if(i == ICMP)
			document.tF["blocked_service_"+(index/2)].value = 2; //PING
		else
			document.tF["blocked_service_"+(index/2)].value = USER_DEFINED;
	}
	else
	{
		document.tF["port_range_"+index].disabled = false;
	}
}

function BlockAllClickCheck(checked)
{
	if(checked)
	{
		document.tF.sun.checked = true;
		document.tF.sun.disabled = true;
		document.tF.mon.checked = true;
		document.tF.mon.disabled = true;
		document.tF.tue.checked = true;
		document.tF.tue.disabled = true;
		document.tF.wed.checked = true;
		document.tF.wed.disabled = true;
		document.tF.thu.checked = true;
		document.tF.thu.disabled = true;
		document.tF.fri.checked = true;
		document.tF.fri.disabled = true;
		document.tF.sat.checked = true;
		document.tF.sat.disabled = true;
	}
	else
	{
		document.tF.sun.disabled = false;
		document.tF.mon.disabled = false;
		document.tF.tue.disabled = false;
		document.tF.wed.disabled = false;
		document.tF.thu.disabled = false;
		document.tF.fri.disabled = false;
		document.tF.sat.disabled = false;
	}
}

function CheckTimeDisable()
{
	var st = document.tF.time[0].checked;
	document.tF.starthour.disabled = st;
	document.tF.startminute.disabled = st;
	document.tF.endhour.disabled = st;
	document.tF.endminute.disabled = st;
}

function DoSubmitMember(param)
{
	//console.info(param);
	var url = "apply.cgi";
	var ajax = new Ajax(url, {method: "post", data : param , onComplete: AddedMember}).request();
}

function SavedMember()
{
	location.href = location.href;
}

function DoSaveToFlash()
{
	var url = "apply.cgi";
	var buf = "";
	buf += CreateAjaxInput("action", "save");
	buf += CreateAjaxInput("page", "firewall_ac.stm");
	buf += CreateAjaxInput("arc_action", "access_control");
	buf += CreateAjaxInput("ac_enable", document.tF.ac_enable[0].checked?"1":"0");
	
	var ajax = new Ajax(url, {method: "post", data : buf , onComplete: SavedMember}).request();
}

function AddedMember(txt)
{
	//console.info("add member " + txt + " finish!!");
	cur_submit_idx++;
	
	if(cur_submit_idx >= m_list.length + 1)
	{
		DoSaveToFlash();
		return;
	}
	
	if(cur_submit_idx < m_list.length) 
		PrepareData(cur_submit_idx);
	else if(cc_list.g_entry.isAdded)
		PrepareData(GUEST_SSID_INDEX);
	else
		DoSaveToFlash(); //Save when finish saving all members.
}

function DeletedAllMember(txt)
{
	//console.info(txt);
	if(cur_submit_idx < m_list.length) 
		PrepareData(cur_submit_idx);
	else if(cc_list.g_entry.isAdded)
		PrepareData(GUEST_SSID_INDEX);
	else
		DoSaveToFlash();
}

function CreateAjaxInput(name, value)
{
	return name + "=" + value + "&";
}

function SubmitInit()
{
	SaveMember(cur_member);
	cur_submit_idx = 0;
	
	var url = "apply.cgi";
	var buf = "";
	buf += CreateAjaxInput("action", "delete_all");
	buf += CreateAjaxInput("page", "firewall_ac.stm");
	buf += CreateAjaxInput("arc_action", "access_control");
	
	var ajax = new Ajax(url, {method: "post", data : buf , onComplete: DeletedAllMember}).request();
}


function PrepareData(i)
{
	//console.log("PrepareData("+i+")");
	var buf;
	buf = "";
	buf += CreateAjaxInput("action", "add");
	buf += CreateAjaxInput("page", "firewall_ac.stm");
	buf += CreateAjaxInput("arc_action", "access_control");
	var e;
	if(i == GUEST_SSID_INDEX)
	{
		buf += CreateAjaxInput("member_num", m_list.length);
		e = m_list.guest_entry;
	}
	else
	{
		buf += CreateAjaxInput("member_num", i);
		e = m_list.entry[i];
	}
	buf += CreateAjaxInput("host", e.host);
	buf += CreateAjaxInput("mac", e.mac);
	buf += CreateAjaxInput("status", e.status);
	buf += CreateAjaxInput("rest", e.rest);
	buf += CreateAjaxInput("days", e.sun+":"+e.mon+":"+e.tue+":"+e.wed+":"+e.thu+":"+e.fri+":"+e.sat);
	//buf += CreateAjaxInput("hour24", e.hour24);
	if(e.hour24)
	{
		buf += CreateAjaxInput("start_time", "0:0:0");
		buf += CreateAjaxInput("end_time", "23:59:59");
	}
	else
	{
		buf += CreateAjaxInput("start_time", e.startHour+":"+e.startMinute*MINUTE_INTERVAL+":0");
		buf += CreateAjaxInput("end_time", e.endHour+":"+e.endMinute*MINUTE_INTERVAL+":0");
	}
	
	for(var j=0;j<5;j++)
	{
		s = e.services[j];
		var port_string = s.portString1;
		var protocol = s.portProtocol1;
		switch(parseInt(protocol))
		{
			case TCP: protocol = 6; break;
			case UDP: protocol = 17; break;
			case TCP_OR_UDP: protocol = 254; break;
			case ICMP: protocol = 1; break;
			case IGMP: protocol = 2; break;
			case NONE: protocol = 0; break;
		}
		if(port_string == "") port_string = "0";
		//CreateAjaxInput(f, "service_"+i+j, s.service+":"+s.portProtocol1+":"+s.portString1+":"+s.portProtocol2+":"+s.portString2);
		buf += CreateAjaxInput("service_"+j, s.service+":"+protocol+":"+port_string);
	}
	
	for(var j=0;j<4;j++)
		buf += CreateAjaxInput("url_"+j, e.urls[j]);
	
	for(var j=0;j<6;j++)
		buf += CreateAjaxInput("keyword_"+j, e.keywords[j]);
	
	DoSubmitMember(buf);
	
	return true;
}


function SetStatus(i)
{
	var e = (i == GUEST_SSID_INDEX)?m_list.guest_entry:m_list.entry[i];
	e.status = document.tF["status_"+i][0].checked?1:0;
}

function SetRest(i)
{
	var e = (i == GUEST_SSID_INDEX)?m_list.guest_entry:m_list.entry[i];
	e.rest = document.tF["rest_"+i][0].checked?0:1;
}

function CheckScheduleRange()
{
	var f = document.tF;
	var sh = parseInt(f.starthour.value);
	var eh = parseInt(f.endhour.value);
	var sm = parseInt(f.startminute.value);
	var em = parseInt(f.endminute.value);
	for(var i=0;i<f.starthour.options.length;i++)
	{
		if(i <= eh)
			f.starthour.options[i].disabled = false;
		else
			f.starthour.options[i].disabled = true;
	}
	
	for(var i=0;i<f.endhour.options.length;i++)
	{
		if(i >= sh)
			f.endhour.options[i].disabled = false;
		else
			f.endhour.options[i].disabled = true;
	}
	
	for(var i=0;i<f.startminute.options.length;i++)
	{
		if(sh == eh && i > em)
			f.startminute.options[i].disabled = true;
		else
			f.startminute.options[i].disabled = false;
	}
	
	for(var i=0;i<f.endminute.options.length;i++)
	{
		if(sh == eh && i < sm)
			f.endminute.options[i].disabled = true;
		else
			f.endminute.options[i].disabled = false;
	}
	
	if(sh == eh)
	{
		if(sm > em)
		{
			f.startminute.selectedIndex = 0;
			f.endminute.selectedIndex = 0;
		}
	}
	
	emulate(f.starthour);
	emulate(f.endhour);
	emulate(f.startminute);
	emulate(f.endminute);
}

function SaveMember(i)
{
	if(i == -1) return;
	var f = document.tF;
	var e = (i == GUEST_SSID_INDEX)?m_list.guest_entry:m_list.entry[i];
	e.status = f["status_"+i][0].checked?1:0;
	e.rest = f["rest_"+i][0].checked?0:1;
	e.everyday = f.alldays.checked?1:0;
	e.sun = f.sun.checked?1:0;
	e.mon = f.mon.checked?1:0;
	e.tue = f.tue.checked?1:0;
	e.wed = f.wed.checked?1:0;
	e.thu = f.thu.checked?1:0;
	e.fri = f.fri.checked?1:0;
	e.sat = f.sat.checked?1:0;
	e.hour24 = f.time[0].checked?1:0;
	e.startHour = f.starthour.value;
	e.startMinute = f.startminute.value;
	e.endHour = f.endhour.value;
	e.endMinute = f.endminute.value;
	for(var j=0;j<5;j++)
	{
		e.services[j].service = f["blocked_service_"+j].value;
		e.services[j].portProtocol1 = f["svc_type_"+(j*2)].value;
		//e.services[j].portProtocol2 = f["svc_type_"+(j*2+1)].value;
		e.services[j].portString1 = f["port_range_"+(j*2)].value;
		//e.services[j].portString2 = f["port_range_"+(j*2+1)].value;
	}
	for(var j=0;j<4;j++)
	{
		e.urls[j] = f["url"+(j+1)].value;
	}
	for(var j=0;j<6;j++)
	{
		e.keywords[j] = f["keyword"+(j+1)].value;
	}
}

function LoadMember(i)
{
	if(i == -1) return;
	var f = document.tF;
	var e = (i == GUEST_SSID_INDEX)?m_list.guest_entry:m_list.entry[i];
	f.alldays.checked = (e.everyday==1)?true:false;
	f.sun.checked = (e.sun==1)?true:false;
	f.mon.checked = (e.mon==1)?true:false;
	f.tue.checked = (e.tue==1)?true:false;
	f.wed.checked = (e.wed==1)?true:false;
	f.thu.checked = (e.thu==1)?true:false;
	f.fri.checked = (e.fri==1)?true:false;
	f.sat.checked = (e.sat==1)?true:false;
	BlockAllClickCheck(f.alldays.checked);
	if(e.hour24 == 1) f.time[0].checked = true;
	else f.time[1].checked = true;
	f.starthour.value = e.startHour;
	f.startminute.value = e.startMinute;
	f.endhour.value = e.endHour;
	f.endminute.value = e.endMinute;
	CheckTimeDisable();
	CheckScheduleRange();
	for(var j=0;j<5;j++)
	{
		f["blocked_service_"+j].value = e.services[j].service;
		if(e.services[j].service == USER_DEFINED)
		{
			f["svc_type_"+(j*2)].value = e.services[j].portProtocol1;
			//f["svc_type_"+(j*2+1)].value = e.services[j].portProtocol2;
			f["port_range_"+(j*2)].value = e.services[j].portString1;
			//f["port_range_"+(j*2+1)].value = e.services[j].portString2;
		}
		CheckService(j);
	}
	for(var j=0;j<4;j++)
	{
		f["url"+(j+1)].value = e.urls[j];
	}
	for(var j=0;j<6;j++)
	{
		f["keyword"+(j+1)].value = e.keywords[j];
	}
}

//==============================================================================
function addEvent(elm, evType, fn) 
{ 
	if (elm.addEventListener){
		elm.addEventListener(evType, fn, false);
		return true;
	} else if (elm.attachEvent){
		var r = elm.attachEvent("on"+evType, fn);
		return r;
	} else {
		return false;
	}
}  
//==============================================================================
function isValidMacAddress(address) {
	var c = '';
	var i = 0, j = 0;

	if ( address.toLowerCase() == 'ff:ff:ff:ff:ff:ff' ) return false;
	if(address.toLowerCase() == '00:00:00:00:00:00' || address.toLowerCase() == '0:0:0:0:0:0' ) return false;

	addrParts = address.split(':');
	if ( addrParts.length != 6 ) return false;

	for (i = 0; i < 6; i++) {
		if(addrParts[i].length != 2) return false;
		for ( j = 0; j < addrParts[i].length; j++ ) {
			c = addrParts[i].toLowerCase().charAt(j);
			if ( (c >= '0' && c <= '9') ||
				(c >= 'a' && c <= 'f') )
				continue;
			else
				return false;
		}
	}

	return true;
}
//==============================================================================
function ReloadSelectElement() {
	if (document.getElementsByTagName) {
		var s = document.getElementsByTagName("select");

		if (s.length > 0) {
			window.select_current = new Array();

			for (var i=0, select; select = s[i]; i++) {
				var name = select.name;
				if(name == "starthour" || name == "startminute" || name == "endhour" || name == "endminute")
				{
					select.onfocus = function(){ window.select_current[this.id] = this.selectedIndex; }
					select.onchange = function(){ restore(this); CheckScheduleRange(); this.blur();}
					emulate(select);
				}
			}
		}
	}
}
//==============================================================================
function restore(e) {
	if (e.options[e.selectedIndex].disabled) {
		e.selectedIndex = window.select_current[e.id];
	}
}
//==============================================================================
function emulate(e) {
	for (var i=0, option; option = e.options[i]; i++) {
		if (option.disabled) {
			option.style.color = "graytext";
		}
		else {
			option.style.color = "menutext";
		}
	}
}
//==============================================================================