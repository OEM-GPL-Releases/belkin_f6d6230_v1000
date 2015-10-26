var S_WELCOME =				0;
var S_COUNTRY =				1;
var S_USERNAME_PASSWORD =	2;
var S_ISP =						3;
var S_CONN_TYPE =				4;
var S_STATIC_INFO =			5;
var S_PPPOE_INFO =			6;
var S_PPTP_INFO =				7;
var S_IMPLEMENT =				8;
var S_CHECK =					9;
var S_REBOOT =					10;
var S_CHECK_STATIC =			11;
var S_CHECK_PPPOE =			12;
var S_CHECK_PPTP =			13;
var S_SUPPORT =				14;
var S_SECURITY =				15;
var S_FINISH =					16;
var S_CD_SETUP =				17;
var S_CHECK_SECOND = 18;

var JS_PROTO_DHCP =						1;
var JS_PROTO_PPPOE =					2;
var JS_PROTO_PPTP =						3;
var JS_PROTO_STATIC =					4;
var JS_PROTO_ALL =							5;
var JS_PROTO_STATIC_PPPOE_OTHER =	6;
var JS_PROTO_STATIC_DHCP_OTHER =	7;
var JS_PROTO_PPPOE_DHCP_OTHER =		8;
var JS_PROTO_PPPOE_PPTP_OTHER =		9;
var JS_PROTO_PPTP_DHCP_OTHER =		10;
var JS_PROTO_UNKNOWN =					11;

var B_NONE =					0;
var B_NEXT =					1;
var B_NEXT_BACK_CANCEL =	2;
var B_DNEXT_BACK_CANCEL =	3;
var B_END_BACK_CANCEL =		4;
var B_SKIP_APPLY =			5;
var B_BACK_FINISH =			6;


//var connected = false;
var country_modified = false;
var isp_init = false;
var pppoe_init = false;
var cur_conn_type = JS_PROTO_PPPOE;
//var cur_button = B_NEXT;
var cur_step = S_WELCOME;

function Init()
{
//	if(connected == true)
//		cur_step = S_SECURITY;
	
	/*begin_normal = new Image;
	begin_over = new Image;
	begin_normal.src = "images/begin_normal.gif";
	begin_over.src = "images/begin_over.gif";*/
	
	next_normal = new Image;
	next_over = new Image;
	next_normal.src = "images/next_normal.gif";
	next_over.src = "images/next_over.gif";
	
	next_alone_normal = new Image;
	next_alone_over = new Image;
	next_alone_normal.src = "images/begin_normal.gif";
	next_alone_over.src = "images/begin_over.gif";
	
	next_dis_normal = new Image;
	next_dis_over = new Image;
	next_dis_normal.src = "images/next_normal.gif";
	next_dis_over.src = "images/next_over.gif";
	
	back_normal = new Image;
	back_over = new Image;
	back_normal.src = "images/back_normal.gif";
	back_over.src = "images/back_over.gif";
	
	finish_normal = new Image;
	finish_over = new Image;
	finish_normal.src = "images/finish_normal.gif";
	finish_over.src = "images/finish_over.gif";
	
	skip_normal = new Image;
	skip_over = new Image;
	skip_normal.src = "images/skip_normal.gif";
	skip_over.src = "images/skip_over.gif";
	
	apply_normal = new Image;
	apply_over = new Image;
	apply_normal.src = "images/apply_normal.gif";
	apply_over.src = "images/apply_over.gif";
	
	/*try_normal = new Image;
	try_over = new Image;
	try_normal.src = "images/try_normal.gif";
	try_over.src = "images/try_over.gif";	*/
	
	end_normal = new Image;
	end_over = new Image;
	end_normal.src = "images/end_normal.gif";
	end_over.src = "images/end_over.gif";	
	
	InitCurStep();
}
var step_name = [
	"welcome", "country", "username_password", "isp", "connection_type", "static_info",
	"pppoe_info", "pptp_info", "implement", "check", "reboot", "check_static",
	"check_pppoe", "check_pptp", "support", "security", "finish", "cd_setup", "check_second"
];

var back_path = new Array();


function CountryInfo(start, end, def, name)
{
	this.start = start;
	this.end = end;
	this.default_index = def;
	this.name = name;
}

var country_info = new Array();
country_info[1]  = new CountryInfo(0,		0,		0,		"Australia"),
country_info[2]  = new CountryInfo(0,		13,	13,	"Austria"),
country_info[3]  = new CountryInfo(14,		18,	14,	"Belgium"),
country_info[4]  = new CountryInfo(19,		22,	19,	"China"),
country_info[5]  = new CountryInfo(23,		23,	23,	"Czech"),
country_info[6]  = new CountryInfo(24,		25,	24,	"Denmark"),
country_info[7]  = new CountryInfo(26,		36,	26,	"France"),
country_info[8]  = new CountryInfo(37,		82,	37,	"Germany"),
country_info[9]  = new CountryInfo(83,		84,	83,	"Hungray"), // 3
country_info[10] = new CountryInfo(85,		86,	85,	"Indonesia"), // 6
country_info[11] = new CountryInfo(87,		87,	87,	"Israel"), // 3
country_info[12] = new CountryInfo(88,		100,	88,	"Italy"), // 4
country_info[13] = new CountryInfo(101,	101,	101,	"Japan"), // 10
country_info[14] = new CountryInfo(102,	102,	102,	"Korea"), // 3
country_info[15] = new CountryInfo(103,	106,	103,	"Malaysia" ),	// 2				
country_info[16] = new CountryInfo(107,	123,	107,	"Netherlands"), // 7
country_info[17] = new CountryInfo(0,		0,		0,		"New Zealand"),	// 7
country_info[18] = new CountryInfo(124,	126,	124,	"Norway"), // 7
country_info[19] = new CountryInfo(127,	133,	127,	"Portugal"), // 7	
country_info[20] = new CountryInfo(134,	167,	134,	"Singapore"), // 7	
country_info[21] = new CountryInfo(138,	143,	138,	"Spain"), // 7	
country_info[22] = new CountryInfo(144,	155,	144,	"Sweden"), // 7	
country_info[23] = new CountryInfo(156,	163,	156,	"Swilzerland"), // 7	
country_info[24] = new CountryInfo(164,	174,	164,	"Tailand"), // 7	
country_info[25] = new CountryInfo(175,	179,	175,	"UK"), // 7	
country_info[26] = new CountryInfo(180,	228,	180,	"United States of American"), // 7	
country_info[27] = new CountryInfo(0,		0,		0,		"Others")

function ISPInfo(proto, name, pppoename)
{
	this.protocol = proto;
	this.name = name;
	this.pppoename = pppoename;
}


var isp_info = new Array();
// Austria
isp_info[0] = new ISPInfo(0, 						"Please Select a Service Provider...", "");
isp_info[1] = new ISPInfo(JS_PROTO_PPPOE,	"AON", "10 Digit Username");
isp_info[2] = new ISPInfo(JS_PROTO_STATIC,	"AON E-CARD", "");
isp_info[3] = new ISPInfo(JS_PROTO_DHCP,		"CHELLO", "");
isp_info[4] = new ISPInfo(JS_PROTO_ALL,		"EDUHI", "");
isp_info[5] = new ISPInfo(JS_PROTO_PPPOE,	"EUNET", "Username@EUNET.at");
isp_info[6] = new ISPInfo(JS_PROTO_PPPOE,	"INODE", ""); 
isp_info[7] = new ISPInfo(JS_PROTO_PPPOE,	"KABELSIGNAL", "");
isp_info[8] = new ISPInfo(JS_PROTO_PPPOE,	"SIVER SURFER", "" );
isp_info[9] = new ISPInfo(JS_PROTO_PPPOE,	"TELE2", "Username@TELE2.at" );
isp_info[10] = new ISPInfo(JS_PROTO_DHCP,	"TELKABE", "" );
isp_info[11] = new ISPInfo(JS_PROTO_PPPOE,	"T-ONLINE", "28-digits@T-ONLINE.at" );
isp_info[12] = new ISPInfo(JS_PROTO_PPPOE,	"UNI-ADSL", "Username@ADSL.UNIWIE.AC.AT" );
isp_info[13] = new ISPInfo(JS_PROTO_PPPOE,	"UTA", "" );

// Belgium ISPs
isp_info[14] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[15] = new ISPInfo(JS_PROTO_PPPOE,	"Belgacom/Skynet", "");
isp_info[16] = new ISPInfo(JS_PROTO_PPPOE,	"Cybernet", "...@CYBERNET");
isp_info[17] = new ISPInfo(JS_PROTO_PPPOE,	"Tele 2", "");
isp_info[18] = new ISPInfo(JS_PROTO_DHCP,	"Telenet/Pandora", "");

// China ISPs
isp_info[19] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[20] = new ISPInfo(JS_PROTO_PPPOE,	"China Telecom", "");
isp_info[21] = new ISPInfo(JS_PROTO_DHCP,	"Cable Modem", "");
isp_info[22] = new ISPInfo(JS_PROTO_DHCP,	"China Netcom", "");

// Czech no ISP
isp_info[23] = new ISPInfo(0, 					"Please Select a Service Provider...", "");

// Denmark ISP
isp_info[24] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[25] = new ISPInfo(JS_PROTO_PPPOE,	"TDC", "");

// France ISPs
isp_info[26] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[27] = new ISPInfo(JS_PROTO_PPPOE,	"9online/9telecom", "@9online");
isp_info[28] = new ISPInfo(JS_PROTO_PPPOE,	"Alice/Tiscali", ""); 
isp_info[29] = new ISPInfo(JS_PROTO_PPPOE,	"AOL", "...@aol.com");
isp_info[30] = new ISPInfo(JS_PROTO_DHCP,	"Chello", "");
isp_info[31] = new ISPInfo(JS_PROTO_PPPOE,	"Club Internet", "@clubadsl1");
isp_info[32] = new ISPInfo(JS_PROTO_DHCP,	"Noos", "");
isp_info[33] = new ISPInfo(JS_PROTO_DHCP,	"Numericable", "");
isp_info[34] = new ISPInfo(JS_PROTO_PPPOE,	"Orange/Wanadoo", "fti/");
isp_info[35] = new ISPInfo(JS_PROTO_PPPOE,	"Tele2", "@tele2.fr");
isp_info[36] = new ISPInfo(JS_PROTO_PPPOE,	"Wanadoo Cable", "fti/");

// Germany ISPs
isp_info[37] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[38] = new ISPInfo(JS_PROTO_PPPOE,	"1&1", "1und1/username@online.de");
isp_info[39] = new ISPInfo(JS_PROTO_PPPOE,	"ALICE", "Same as telephone number");
isp_info[40] = new ISPInfo(JS_PROTO_PPPOE,	"AOL", "Username@de.aol.com");
isp_info[41] = new ISPInfo(JS_PROTO_PPPOE,	"ARCOR", "AR followed by 10 or 11 digits");
isp_info[42] = new ISPInfo(JS_PROTO_PPPOE,	"BiTEL", ""); 
isp_info[43] = new ISPInfo(JS_PROTO_PPPOE,	"CALLANDO", "DSLFLAT/Usernumber%CALLANDO");
isp_info[44] = new ISPInfo(JS_PROTO_DHCP,	"CityKom", "");
isp_info[45] = new ISPInfo(JS_PROTO_PPPOE,	"CNE", "Username@CNE-DSL.de");
isp_info[46] = new ISPInfo(JS_PROTO_PPPOE,	"COMPUSERVE", "E-MailName@COMPUSERVEPRO.de");
isp_info[47] = new ISPInfo(JS_PROTO_PPPOE,	"COMTEL", "Username@FONINET.de");
isp_info[48] = new ISPInfo(JS_PROTO_PPPOE,	"CONGSTER", "DSL/CustomerNumber@CONGSTER.de");
isp_info[49] = new ISPInfo(JS_PROTO_PPPOE,	"DOKOM", "");
isp_info[50] = new ISPInfo(JS_PROTO_PPPOE,	"ENVIATEL", "");
isp_info[51] = new ISPInfo(JS_PROTO_PPPOE,	"EWETEL", "Username (without ISP suffix)");
isp_info[52] = new ISPInfo(JS_PROTO_PPPOE,	"FREENET", "FRN6/Username");
isp_info[53] = new ISPInfo(JS_PROTO_PPPOE,	"GMX", ""); 
isp_info[54] = new ISPInfo(JS_PROTO_PPPOE,	"HANSENET", ""); 
isp_info[55] = new ISPInfo(JS_PROTO_PPPOE,	"HANSNET(2)", "");
isp_info[56] = new ISPInfo(JS_PROTO_PPPOE,	"HELENET", ""); 
isp_info[57] = new ISPInfo(JS_PROTO_PPPOE,	"HTP", ""); 
isp_info[58] = new ISPInfo(JS_PROTO_STATIC_PPPOE_OTHER, "INFOCITY", "");
isp_info[59] = new ISPInfo(JS_PROTO_DHCP,	"KABELBW", "");
isp_info[60] = new ISPInfo(JS_PROTO_PPPOE,	"LYCOS", ""); 
isp_info[61] = new ISPInfo(JS_PROTO_PPPOE_PPTP_OTHER,"MEDIACOM", "");
isp_info[62] = new ISPInfo(JS_PROTO_PPPOE,	"M-NET", "");
isp_info[63] = new ISPInfo(JS_PROTO_PPPOE,	"MULTIKABEL ISDN", "");
isp_info[64] = new ISPInfo(JS_PROTO_PPPOE,	"NEF KOM", "");
isp_info[65] = new ISPInfo(JS_PROTO_PPPOE,	"NEOKOM", "");
isp_info[66] = new ISPInfo(JS_PROTO_PPPOE,	"NET DSL", "");
isp_info[67] = new ISPInfo(JS_PROTO_PPPOE,	"NETCOLOGNE", "NC-Username@netcolgne.de");
isp_info[68] = new ISPInfo(JS_PROTO_PPPOE,	"NETCOLOGNE(2)", "");
isp_info[69] = new ISPInfo(JS_PROTO_PPPOE,	"NEWDSL", "");
isp_info[70] = new ISPInfo(JS_PROTO_PPPOE,	"NORDKOM", "");
isp_info[71] = new ISPInfo(JS_PROTO_PPPOE,	"PRIMACOM", "");
isp_info[72] = new ISPInfo(JS_PROTO_PPPOE,	"PRIMACOM/Primasped", "");
isp_info[73] = new ISPInfo(JS_PROTO_DHCP,	"NEWDSL", "");
isp_info[74] = new ISPInfo(JS_PROTO_PPPOE,	"QDSL", "");
isp_info[75] = new ISPInfo(JS_PROTO_PPPOE,	"R2 ONLINE", "");
isp_info[76] = new ISPInfo(JS_PROTO_PPPOE,	"SCHLUND+PARTNER", "");
isp_info[77] = new ISPInfo(JS_PROTO_PPPOE,	"TELEBEL", "");
isp_info[78] = new ISPInfo(JS_PROTO_PPPOE,	"TISCALI", "E-MailName@TISCALI.de");
isp_info[79] = new ISPInfo(JS_PROTO_PPPOE,	"T-LINK", "a234ABCetc5T-LINK");
isp_info[80] = new ISPInfo(JS_PROTO_PPPOE,	"T-ONLINE", "Anschlusskennung+T-OnlineNumber+0001@T-ONLINE.de");
isp_info[81] = new ISPInfo(JS_PROTO_PPPOE,	"T-ONLINE BUSINESS(T-KOM)", "T-ONLINE-COM/USERNAME@T-ONLINE-COM.de");
isp_info[82] = new ISPInfo(JS_PROTO_PPPOE,	"VERSATEL", "Username@VERSATEL.de");

// Hungary ISPs
isp_info[83] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[84] = new ISPInfo(JS_PROTO_PPPOE,	"Matav Telecom", "");

// Indonesia ISPs
isp_info[85] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[86] = new ISPInfo(JS_PROTO_PPPOE,	"Telkom Speedy - Huawei", "");

// Israel ISPs
isp_info[87] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
	
// Italy  ISPs
isp_info[88] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[89] = new ISPInfo(JS_PROTO_STATIC,	"ALBACOM", "");
isp_info[90] = new ISPInfo(JS_PROTO_PPPOE,	"ALICE", "");
isp_info[91] = new ISPInfo(JS_PROTO_DHCP,	"ARIATEL", "");
isp_info[92] = new ISPInfo(JS_PROTO_DHCP,	"ELITEL", "");
isp_info[93] = new ISPInfo(JS_PROTO_DHCP,	"FASTWEB FULL(FIBRA OTTICA)", "");
isp_info[94] = new ISPInfo(JS_PROTO_DHCP,	"FASTWEB LIGHT(ADSL)", "");
isp_info[95] = new ISPInfo(JS_PROTO_DHCP,	"LIBERRO/WIND/IFOSTRADA", "");
isp_info[96] = new ISPInfo(JS_PROTO_DHCP,	"Libero Mega&Liberom Mini", "");
isp_info[97] = new ISPInfo(JS_PROTO_DHCP,	"TELE2", "");
isp_info[98] = new ISPInfo(JS_PROTO_STATIC,	"TELECOM ITALIA ADSL Smart 10/Smart 15", "");
isp_info[99] = new ISPInfo(JS_PROTO_DHCP,	"TIN.IT/VIRGILIO", "");
isp_info[100] = new ISPInfo(JS_PROTO_DHCP,	"TISCALI", "");

// Japan ISPs
isp_info[101] = new ISPInfo(0, 					"Please Select a Service Provider...", "");

// Korea ISPs
isp_info[102] = new ISPInfo(0, 					"Please Select a Service Provider...", "");

// Malaysia ISPs
isp_info[103] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[104] = new ISPInfo(JS_PROTO_PPPOE,	"streamyx Home", "");
isp_info[105] = new ISPInfo(JS_PROTO_PPPOE,	"Jaring", "");
isp_info[106] = new ISPInfo(JS_PROTO_PPPOE,	"Streamyx PutraJaya", "");

// Netherlands ISPs
isp_info[107] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[108] = new ISPInfo(JS_PROTO_PPPOE,	"Caiway", "");
isp_info[109] = new ISPInfo(JS_PROTO_DHCP,	"Chello", "");
isp_info[110] = new ISPInfo(JS_PROTO_DHCP,	"Demon", "");
isp_info[111] = new ISPInfo(JS_PROTO_DHCP,	"Essent", "");
isp_info[112] = new ISPInfo(JS_PROTO_DHCP,	"Home", "");
isp_info[113] = new ISPInfo(JS_PROTO_PPPOE,	"Kabelfoon", "");
isp_info[114] = new ISPInfo(JS_PROTO_PPTP_DHCP_OTHER,"KPN ADSL", "");
isp_info[115] = new ISPInfo(JS_PROTO_DHCP,	"MultiKabel", "");
isp_info[116] = new ISPInfo(JS_PROTO_DHCP,	"Nuts Online", "");
isp_info[117] = new ISPInfo(JS_PROTO_DHCP,	"Quicknet", "");
isp_info[118] = new ISPInfo(JS_PROTO_DHCP,	"Scarlet", "");
isp_info[119] = new ISPInfo(JS_PROTO_DHCP,	"Tiscali(router)", "");
isp_info[120] = new ISPInfo(JS_PROTO_DHCP,	"UPC", "");
isp_info[121] = new ISPInfo(JS_PROTO_PPPOE,	"Wanadoo cable - Com21 modem", "");
isp_info[122] = new ISPInfo(JS_PROTO_DHCP,	"Wanadoo cable - Motorola modem", "");
isp_info[123] = new ISPInfo(JS_PROTO_DHCP,	"Zeeland net", "");

// Norway ISPs	
isp_info[124] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[125] = new ISPInfo(JS_PROTO_DHCP,	"Bluecom", "");
isp_info[126] = new ISPInfo(JS_PROTO_PPPOE,	"Telenor", "");

// Portugal ISPs	
isp_info[127] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[128] = new ISPInfo(JS_PROTO_PPPOE,	"Novis", "");
isp_info[129] = new ISPInfo(JS_PROTO_PPPOE,	"Oni", "");
isp_info[130] = new ISPInfo(JS_PROTO_PPPOE,	"PT", "");
isp_info[131] = new ISPInfo(JS_PROTO_PPPOE,	"Sapo", "");
isp_info[132] = new ISPInfo(JS_PROTO_PPPOE,	"Telepac", "");
isp_info[133] = new ISPInfo(JS_PROTO_PPPOE,	"ViaNetworks", "");

// Singapore ISPs	
isp_info[134] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[135] = new ISPInfo(JS_PROTO_PPPOE,	"SingNet", "");
isp_info[136] = new ISPInfo(JS_PROTO_PPPOE,	"Pacific Net", "");
isp_info[137] = new ISPInfo(JS_PROTO_PPPOE,	"LGA", "");

// Spain ISPs	
isp_info[138] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[139] = new ISPInfo(JS_PROTO_PPPOE,	"Jazztel(20Mb)", "");
isp_info[140] = new ISPInfo(JS_PROTO_DHCP,	"Most", "");
isp_info[141] = new ISPInfo(JS_PROTO_PPPOE,	"Telefonica PPPoE", "");
isp_info[142] = new ISPInfo(JS_PROTO_PPPOE,	"Terra PPPoE", "");
isp_info[143] = new ISPInfo(JS_PROTO_PPPOE,	"Ya.com PPPoE", "");

// Sweden ISPs	
isp_info[144] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[145] = new ISPInfo(JS_PROTO_DHCP,	"Bredbandsbolaget", "");
isp_info[146] = new ISPInfo(JS_PROTO_DHCP,	"Glocalnet Dynamic", "");
isp_info[147] = new ISPInfo(JS_PROTO_STATIC,"Glocanet Static", "");
isp_info[148] = new ISPInfo(JS_PROTO_DHCP,	"Netadvanced", "");
isp_info[149] = new ISPInfo(JS_PROTO_PPPOE,	"Ovriga", "");
isp_info[150] = new ISPInfo(JS_PROTO_DHCP,	"Skanova", "");
isp_info[151] = new ISPInfo(JS_PROTO_PPPOE,	"Tele2", "");
isp_info[152] = new ISPInfo(JS_PROTO_PPPOE,	"Telenordia", "");
isp_info[153] = new ISPInfo(JS_PROTO_DHCP,	"Telia", "");
isp_info[154] = new ISPInfo(JS_PROTO_DHCP,	"TYFON", "");
isp_info[155] = new ISPInfo(JS_PROTO_DHCP,	"WEXNET", "");

// Switzerlan ISPs	
isp_info[156] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[157] = new ISPInfo(JS_PROTO_PPPOE,	"Bluewin", "");
isp_info[158] = new ISPInfo(JS_PROTO_PPPOE,	"Cablecom", "");
isp_info[159] = new ISPInfo(JS_PROTO_PPPOE,	"Cybernet", "");
isp_info[160] = new ISPInfo(JS_PROTO_PPPOE,	"Green", "");
isp_info[161] = new ISPInfo(JS_PROTO_PPPOE,	"Sunruse", "");
isp_info[162] = new ISPInfo(JS_PROTO_PPPOE,	"Swisscom", "");
isp_info[163] = new ISPInfo(JS_PROTO_PPPOE,	"Tiscali", "");

// Tailand ISPs	
isp_info[164] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[165] = new ISPInfo(JS_PROTO_PPPOE,	"TRUE", "");
isp_info[166] = new ISPInfo(JS_PROTO_PPPOE,	"TOT", "");
isp_info[167] = new ISPInfo(JS_PROTO_PPPOE,	"CS Loxinfo", "");
isp_info[168] = new ISPInfo(JS_PROTO_PPPOE,	"KSC", "");
isp_info[169] = new ISPInfo(JS_PROTO_PPPOE,	"TT&T", "");
isp_info[170] = new ISPInfo(JS_PROTO_PPPOE,	"ADC", "");
isp_info[171] = new ISPInfo(JS_PROTO_PPPOE,	"Samart", "");
isp_info[172] = new ISPInfo(JS_PROTO_PPPOE,	"Q-net", "");
isp_info[173] = new ISPInfo(JS_PROTO_PPPOE,	"Ti-Net", "");
isp_info[174] = new ISPInfo(JS_PROTO_PPPOE,	"UBT", "");

// UK ISPs
isp_info[175] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[176] = new ISPInfo(JS_PROTO_PPPOE,	"AOL", "");
isp_info[177] = new ISPInfo(JS_PROTO_DHCP,	"NTL Cable Modem", "");
isp_info[178] = new ISPInfo(JS_PROTO_DHCP,	"NTL Set Top Box", "");
isp_info[179] = new ISPInfo(JS_PROTO_DHCP,	"Telewest Cable Modem", "");

// United States of American
isp_info[180] = new ISPInfo(0, 					"Please Select a Service Provider...", "");
isp_info[181] = new ISPInfo(JS_PROTO_DHCP,	"Adelphia", "");
isp_info[182] = new ISPInfo(JS_PROTO_PPPOE,	"Ameritech.net", "");
isp_info[183] = new ISPInfo(JS_PROTO_DHCP,	"Armstrong Cable", "");
isp_info[184] = new ISPInfo(JS_PROTO_DHCP,	"AT&T", "");
isp_info[185] = new ISPInfo(JS_PROTO_PPPOE,	"AT&T (Media One)", "");
isp_info[186] = new ISPInfo(JS_PROTO_PPPOE,	"Bell Advantage", "");
isp_info[187] = new ISPInfo(JS_PROTO_PPPOE,	"Bell Canada", "");
isp_info[188] = new ISPInfo(JS_PROTO_PPPOE,	"Bell south", "");
isp_info[189] = new ISPInfo(JS_PROTO_DHCP,	"BlueStar.net", "");
isp_info[190] = new ISPInfo(JS_PROTO_DHCP,	"Charter", "");
isp_info[191] = new ISPInfo(JS_PROTO_DHCP,	"Comcast", "");
isp_info[192] = new ISPInfo(JS_PROTO_PPPOE,	"Covad", "");
isp_info[193] = new ISPInfo(JS_PROTO_DHCP,	"Cox.net", "");
isp_info[194] = new ISPInfo(JS_PROTO_DHCP,	"Earthlink Cable", "");
isp_info[195] = new ISPInfo(JS_PROTO_PPPOE,	"Earthlink DSL(Mind Spring)", "");
isp_info[196] = new ISPInfo(JS_PROTO_DHCP,	"Earthlink Phoenix(Speed choice)", "");
isp_info[197] = new ISPInfo(JS_PROTO_STATIC_DHCP_OTHER,"Empower.com", "");
isp_info[198] = new ISPInfo(JS_PROTO_DHCP,	"Everyones Internet", "");
isp_info[199] = new ISPInfo(JS_PROTO_DHCP,	"Flash.com", "");
isp_info[200] = new ISPInfo(JS_PROTO_STATIC_DHCP_OTHER,"GTE Americast", "");
isp_info[201] = new ISPInfo(JS_PROTO_STATIC_DHCP_OTHER,"GTE Pioneer", "");
isp_info[202] = new ISPInfo(JS_PROTO_PPPOE_DHCP_OTHER,"GTE", "");
isp_info[203] = new ISPInfo(JS_PROTO_DHCP,	"Internet America", "");
isp_info[204] = new ISPInfo(JS_PROTO_DHCP,	"Media One", "");
isp_info[205] = new ISPInfo(JS_PROTO_DHCP,	"MetroCast Cablevision", "");
isp_info[206] = new ISPInfo(JS_PROTO_PPPOE,	"MindSpring", "");
isp_info[207] = new ISPInfo(JS_PROTO_DHCP,	"MSN", "");
isp_info[208] = new ISPInfo(JS_PROTO_DHCP,	"Optimum Online", "");
isp_info[209] = new ISPInfo(JS_PROTO_PPPOE,	"Pacbell DSL", "");
isp_info[210] = new ISPInfo(JS_PROTO_PPPOE,	"Daragon", "");
isp_info[211] = new ISPInfo(JS_PROTO_PPPOE,	"Quest", "");
isp_info[212] = new ISPInfo(JS_PROTO_DHCP,	"RCN", "");
isp_info[213] = new ISPInfo(JS_PROTO_DHCP,	"Roadrunner", "");
isp_info[214] = new ISPInfo(JS_PROTO_DHCP,	"Rogers", "");
isp_info[215] = new ISPInfo(JS_PROTO_PPPOE,	"SBC Global", "");
isp_info[216] = new ISPInfo(JS_PROTO_DHCP,	"Shaw", "");
isp_info[217] = new ISPInfo(JS_PROTO_STATIC_DHCP_OTHER,"SlipNet", "");
isp_info[218] = new ISPInfo(JS_PROTO_PPPOE,	"SNET", "");
isp_info[219] = new ISPInfo(JS_PROTO_PPPOE,	"Southwestern Bell", "");
isp_info[220] = new ISPInfo(JS_PROTO_PPPOE,	"Speed Choice", "");
isp_info[221] = new ISPInfo(JS_PROTO_PPPOE,	"Sprint FastConnect", "");
isp_info[222] = new ISPInfo(JS_PROTO_DHCP,	"Sprint Fixed Wireless", "");
isp_info[223] = new ISPInfo(JS_PROTO_PPPOE,	"Sympatico", "");
isp_info[224] = new ISPInfo(JS_PROTO_DHCP,	"Telus.net", "");
isp_info[225] = new ISPInfo(JS_PROTO_DHCP,	"Time Warner", "");
isp_info[226] = new ISPInfo(JS_PROTO_DHCP,	"Val Paraiso", "");
isp_info[227] = new ISPInfo(JS_PROTO_PPPOE_DHCP_OTHER,"Verizon", "");
isp_info[228] = new ISPInfo(JS_PROTO_DHCP,	"Zoom", "");

function empty(reqObj)
{
	;
}

function CreateAjaxInput(name, value)
{
	return name + "=" + value + "&";
}

function SaveParameterSec(para)
{
	var url = "/cgi-bin/setup_wiz_sec.exe";
	var ajax = new Ajax.Request( url,
		{
			method: 'post',
			parameters: 'action=submit&'+para,
			onComplete: empty
		});
}

function SaveParameter(para)
{
	var url = "/cgi-bin/setup_wiz.exe";
	var ajax = new Ajax.Request( url,
		{
			method: 'post',
			parameters: 'action=submit&'+para,
			onComplete: saveQuickSet
		});
}

function PrepareDataSec()
{
	var buf = "";

	buf = "";
	buf += CreateAjaxInput("wlan_ssid", document.tF.wlan_ssid.value);
	buf += CreateAjaxInput("wlan_key", document.tF.wlan_key.value);
	buf += CreateAjaxInput("guest_ssid", document.tF.guest_ssid.value);
	buf += CreateAjaxInput("guest_key", document.tF.guest_key.value);
	buf += CreateAjaxInput("security_mode20_40", document.tF.security_mode20_40.value);
		
	SaveParameterSec(buf);
}

function PrepareData()
{
	var buf = "";

	buf = "";
	//buf += CreateAjaxInput("country", document.tF.country.value);
	//buf += CreateAjaxInput("isp", document.tF.isp.value);
	//buf += CreateAjaxInput("conn_type_select", document.tF.conn_type_select.value);
	//buf += CreateAjaxInput("conn_type", document.tF.conn_type.value);
	buf += CreateAjaxInput("conn_type_set", document.tF.conn_type_set.value);

	for(var i=0;i<document.tF.elements.length;i++)
	{
		if(document.tF.elements[i].type == 'radio' && !document.tF.elements[i].checked)
			continue;
		else
			buf+= CreateAjaxInput(document.tF.elements[i].name, document.tF.elements[i].value);
	}
		
	SaveParameter(buf);
}

function SaveBegin()
{
	var url = "/cgi-bin/setup_wiz1.exe";
	var ajax = new Ajax.Request( url,
		{
			method: 'post',
			parameters: 'action=submit',
			onComplete: empty
		});
}

function saveQuickSet(reqObj)
{
	eval(reqObj.responseText);
}

function Hide(step)
{
	document.getElementById(step_name[step]).style.display = "none";
}

function Show(step)
{
	document.getElementById(step_name[step]).style.display = "block";
}

function ShowButtons(type)
{
	//hide all buttons
	document.getElementById("btn_cancel").style.display = "none";
	document.getElementById("btn_next").style.display = "none";
	document.getElementById("btn_next_alone").style.display = "none";
	document.getElementById("btn_next_dis").style.display = "none";
	document.getElementById("btn_back").style.display = "none";
	document.getElementById("btn_skip").style.display = "none";
	document.getElementById("btn_finish").style.display = "none";
	document.getElementById("btn_end").style.display = "none";
	//document.getElementById("btn_try").style.display = "none";
	document.getElementById("btn_apply").style.display = "none";
	
	switch(type)
	{
		case B_NONE:
			break;
		case B_NEXT:
			document.getElementById("btn_next_alone").style.display = "block";
			break;
		case B_NEXT_BACK_CANCEL:
			document.getElementById("btn_next").style.display = "block";
			document.getElementById("btn_back").style.display = "block";
			document.getElementById("btn_cancel").style.display = "block";
			break;
		case B_DNEXT_BACK_CANCEL:
			document.getElementById("btn_next_dis").style.display = "block";
			document.getElementById("btn_back").style.display = "block";
			document.getElementById("btn_cancel").style.display = "block";
			break;
		case B_END_BACK_CANCEL:
			document.getElementById("btn_end").style.display = "block";
			document.getElementById("btn_back").style.display = "block";
			document.getElementById("btn_cancel").style.display = "block";
			break;
		case B_SKIP_APPLY:
			document.getElementById("btn_skip").style.display = "block";
			document.getElementById("btn_apply").style.display = "block";
			break;
		case B_BACK_FINISH:
			document.getElementById("btn_back").style.display = "block";
			document.getElementById("btn_finish").style.display = "block";
			break;

	}
}

function NextStep()
{
	//hide current step screen
	Hide(cur_step);

//alert(bWanConnected);	
	
	switch(cur_step)
	{
		case S_WELCOME:
			SaveBegin();
			cur_step = S_COUNTRY;
			back_path[step_name[S_COUNTRY]] = S_WELCOME;
			break;
		case S_COUNTRY:
			var country = parseInt(document.tF.country.value);
			if(country == 5 || country == 11 || country == 13 || country == 14 || country == 27)
			{
				cur_step = S_CONN_TYPE;
				back_path[step_name[S_CONN_TYPE]] = S_COUNTRY;
			}
			else if(country == 1 || country == 17)
			{
				cur_step = S_CD_SETUP;
				back_path[step_name[S_CD_SETUP]] = S_COUNTRY;
			}
			else
			{
				cur_step = S_ISP;
				back_path[step_name[S_ISP]] = S_COUNTRY;
			}
			break;
		case S_USERNAME_PASSWORD:
			cur_step = S_IMPLEMENT;
			back_path[step_name[S_IMPLEMENT]] = S_USERNAME_PASSWORD;
			PrepareData();
			break;
		case S_ISP:
			switch(cur_conn_type)
			{
				case JS_PROTO_DHCP:
					var i = parseInt(document.tF.isp.value);
					var country = parseInt(document.tF.country.value);
					if((country != 1) && (country != 5) && (country != 11) && (country != 13) && (country != 14) && (country != 17) && (country != 27))//except for CD setup and connect type
					{
						if(isp_info[i].protocol == JS_PROTO_DHCP)
							document.tF.conn_type_set.value = JS_PROTO_DHCP;
					}					
					cur_step = S_IMPLEMENT;
					back_path[step_name[S_IMPLEMENT]] = S_ISP;
					PrepareData();
					break;
				case JS_PROTO_PPPOE:
					cur_step = S_PPPOE_INFO;
					back_path[step_name[S_PPPOE_INFO]] = S_ISP;
					break;
				case JS_PROTO_PPTP:
					cur_step = S_PPTP_INFO;
					back_path[step_name[S_PPTP_INFO]] = S_ISP;
					break;
				case JS_PROTO_STATIC:
					cur_step = S_STATIC_INFO;
					back_path[step_name[S_STATIC_INFO]] = S_ISP;
					break;
				case JS_PROTO_UNKNOWN:
					cur_step = S_CONN_TYPE;
					back_path[step_name[S_CONN_TYPE]] = S_ISP;
					break;
			}
			break;
		case S_CONN_TYPE:
			switch(cur_conn_type)
			{
				case JS_PROTO_DHCP:
					cur_step = S_IMPLEMENT;
					back_path[step_name[S_IMPLEMENT]] = S_CONN_TYPE;
					PrepareData();
					break;
				case JS_PROTO_PPPOE:
					cur_step = S_PPPOE_INFO;
					back_path[step_name[S_PPPOE_INFO]] = S_CONN_TYPE;
					break;
				case JS_PROTO_PPTP:
					cur_step = S_PPTP_INFO;
					back_path[step_name[S_PPTP_INFO]] = S_CONN_TYPE;
					break;
				case JS_PROTO_STATIC:
					cur_step = S_STATIC_INFO;
					back_path[step_name[S_STATIC_INFO]] = S_CONN_TYPE;
					break;
			}
			break;
		case S_STATIC_INFO:
			var i = parseInt(document.tF.isp.value);
			var country = parseInt(document.tF.country.value);
				
			if(!(StaticSubmit()))
			{
				;
			}
			else
			{		
				if((country != 1) && (country != 5) && (country != 11) && (country != 13) && (country != 14) && (country != 17) && (country != 27))//except for CD setup and connect type
				{
					if(isp_info[i].protocol == JS_PROTO_STATIC)
						document.tF.conn_type_set.value = JS_PROTO_STATIC;
				}		
				cur_step = S_IMPLEMENT;
				back_path[step_name[S_IMPLEMENT]] = S_STATIC_INFO;
				PrepareData();
			}
			break;
		case S_PPPOE_INFO:
			var i = parseInt(document.tF.isp.value);
			var country = parseInt(document.tF.country.value);
			
			if(!(PppoeSubmit()))
			{
				;
			}
			else
			{
				if((country != 1) && (country != 5) && (country != 11) && (country != 13) && (country != 14) && (country != 17) && (country != 27))
				{
					if(isp_info[i].protocol == JS_PROTO_PPPOE)
					{
						document.tF.conn_type_set.value = JS_PROTO_PPPOE;
					}
				}
				cur_step = S_IMPLEMENT;
				back_path[step_name[S_IMPLEMENT]] = S_PPPOE_INFO;
				PrepareData();				
			}
			break;
		case S_PPTP_INFO:
			var i = parseInt(document.tF.isp.value);
			var country = parseInt(document.tF.country.value);
			
			if(!(PptpSubmit()))
			{
				;//cur_step = S_PPTP_INFO;
			}
			else
			{
				if((country != 1) && (country != 5) && (country != 11) && (country != 13) && (country != 14) && (country != 17) && (country != 27))
				{
					if(isp_info[i].protocol == JS_PROTO_PPTP)
						document.tF.conn_type_set.value = JS_PROTO_PPTP;
				}					
				cur_step = S_IMPLEMENT;
				back_path[step_name[S_IMPLEMENT]] = S_PPTP_INFO;
				PrepareData();
			}
			break;
		case S_IMPLEMENT:
			cur_step = S_CHECK;
			back_path[step_name[S_CHECK]] = S_IMPLEMENT;
			break;
		case S_CHECK:	
			if(bWanConnected==1)
			{
				cur_step = S_SECURITY;
				back_path[step_name[S_SECURITY]] = S_CHECK;
			}	
			else
			{			
				switch(cur_conn_type)
				{
					case JS_PROTO_DHCP:
						cur_step = S_REBOOT;
						back_path[step_name[S_REBOOT]] = S_CHECK;
						break;
					case JS_PROTO_PPPOE:
						cur_step = S_CHECK_PPPOE;
						back_path[step_name[S_CHECK_PPPOE]] = S_CHECK;
						break;
					case JS_PROTO_PPTP:
						cur_step = S_CHECK_PPTP;
						back_path[step_name[S_CHECK_PPTP]] = S_CHECK;
						break;
					case JS_PROTO_STATIC:
						cur_step = S_CHECK_STATIC;
						back_path[step_name[S_CHECK_STATIC]] = S_CHECK;
						break;
				}
			}
			break;
		case S_CHECK_SECOND:	
			if(bWanConnected==1)
			{
				cur_step = S_SECURITY;
				back_path[step_name[S_SECURITY]] = S_CHECK_SECOND;	
			}
			else
			{
				cur_step = S_SUPPORT;
				back_path[step_name[S_SUPPORT]] = S_CHECK_SECOND;	
			}	
			break;				
		case S_REBOOT:
			cur_step = S_CHECK_SECOND;
			back_path[step_name[S_CHECK_SECOND]] = S_REBOOT;
			break;
		case S_CHECK_STATIC:
			/*if(bWanConnected==1)
			{
				cur_step = S_SECURITY;
				back_path[step_name[S_SECURITY]] = S_CHECK_STATIC;	
			}
			else*/
			{
				cur_step = S_REBOOT;
				back_path[step_name[S_REBOOT]] = S_CHECK_STATIC;	
			}					
			break;
		case S_CHECK_PPPOE:
			/*if(bWanConnected==1)
				cur_step = S_SECURITY;
			else		*/
				cur_step = S_REBOOT;		
			back_path[step_name[S_REBOOT]] = S_CHECK_PPPOE;					
			break;
		case S_CHECK_PPTP:
			/*if(bWanConnected==1)
				cur_step = S_SECURITY;
			else		*/	
				cur_step = S_REBOOT;	
			back_path[step_name[S_REBOOT]] = S_CHECK_PPTP;					
			break;
		case S_SUPPORT:
			//cur_step = S_SUPPORT;
			//back_path[step_name[S_SUPPORT]] = S_CHECK_SECOND;			
			break;
		case S_SECURITY:
			cur_step = S_FINISH;
			back_path[step_name[S_FINISH]] = S_SECURITY;
			PrepareDataSec();
			break;
		case S_FINISH:
			break;
		case S_CD_SETUP:
		
			break;
	}
	
	//init the step
	InitCurStep();
	
	//show next step screen
	Show(cur_step);
}

function PrevStep()
{
	//hide current step screen
	Hide(cur_step);
	
	//go back
	cur_step = back_path[step_name[cur_step]];
		
	//init the step
	InitCurStep();
	
	//show next step screen
	Show(cur_step);
}

var clock = 15;
function CalcuClock()
{
	clock--;
	
	if(clock <= 0)
		clock = 0;
	
	document.tF.ramain_sec.value = clock;
	if(clock == 0)
	{
		NextStep();
		clock = 15;
	}
	else
	{
		setTimeout("CalcuClock()", 1000);
	}
	
}


function InitCurStep()
{
	var buttons;

	switch(cur_step)
	{
		case S_WELCOME:
			buttons = B_NEXT;
			break;
		case S_COUNTRY:
			if(country_modified == true)
			{
				buttons = B_NEXT_BACK_CANCEL;
			}
			else
			{
				buttons = B_DNEXT_BACK_CANCEL;
			}
			break;
		case S_USERNAME_PASSWORD:
			buttons = B_DNEXT_BACK_CANCEL;
			break;
		case S_ISP:
			if(country_modified == true && isp_init == false)
			{
				var i = parseInt(document.tF.country.value);
				var start = country_info[i].start;
				var end = country_info[i].end;
				var def = country_info[i].default_index;
				var s = document.tF.isp;
				s.options.length = end - start + 1;
				for(var j=0;j<=end-start;j++)
				{
					s.options[j] = new Option(isp_info[j+start].name, j+start);
				}
				s.options[def-start].checked = true;
			
				InitConnectionType();
				isp_init = true;
			}
			buttons = B_DNEXT_BACK_CANCEL;
			break;
		case S_CONN_TYPE:
			buttons = B_DNEXT_BACK_CANCEL;
			break;
		case S_STATIC_INFO:
			buttons = B_DNEXT_BACK_CANCEL;
			break;
		case S_PPPOE_INFO:
			var form1 = document.tF;
			var country_value = parseInt(form1.country.value);
			var ppoe_mtu = <!--#echo var="pppoe_mtu"-->;
			if(country_value == 5 || country_value == 11 || country_value == 13 || country_value == 14 || country_value == 27) //Countries with no isp list and "Other" country
			{	
				form1.pppoe_username.value = '';
			}
			else
			{
				var isp_value = parseInt(form1.isp.value);
				var pppoename = isp_info[isp_value].pppoename;
				form1.pppoe_username.value = pppoename;
			}
			form1.pppoe_mtu.value = ppoe_mtu;
			ConnectOnDemand(2);
			buttons = B_DNEXT_BACK_CANCEL;
			break;
		case S_PPTP_INFO:
			ConnectOnDemand(3);
			buttons = B_DNEXT_BACK_CANCEL;			
			break;
		case S_IMPLEMENT:
			CalcuClock();
			//setTimeout("CalcuClock()", 1000);	//setTimeout("NextStep()",5000);
			break;
		case S_CHECK:
			setTimeout("NextStep()",3000);
			break;
		case S_CHECK_SECOND:
			setTimeout("NextStep()",3000);
			break;		
		case S_REBOOT:
			buttons = B_NEXT_BACK_CANCEL;
			break;
		case S_CHECK_STATIC:			
			buttons = B_NEXT_BACK_CANCEL;
			break;
		case S_CHECK_PPPOE:
			buttons = B_NEXT_BACK_CANCEL;
			break;
		case S_CHECK_PPTP:		
			buttons = B_NEXT_BACK_CANCEL;
			break;
		case S_SUPPORT:
			buttons = B_END_BACK_CANCEL;
			break;
		case S_SECURITY:
			buttons = B_SKIP_APPLY;
			break;
		case S_FINISH:
			buttons = B_BACK_FINISH;
			break;
		case S_CD_SETUP:
			buttons = B_END_BACK_CANCEL;
			break;
	}
	
	ShowButtons(buttons);

}

function InitConnectionType()
{
	var s = document.tF.conn_type_select;
	var i = parseInt(document.tF.isp.value);
	var go_forward = false;
	switch(isp_info[i].protocol)
	{
		case JS_PROTO_DHCP:
		case JS_PROTO_PPPOE:		
		case JS_PROTO_PPTP:
		case JS_PROTO_STATIC:		
			cur_conn_type = isp_info[i].protocol;
			document.getElementById("conn_type_panel").style.display = "none";
			go_forward = true;
			break;
		case JS_PROTO_ALL:
			s.options.length = 5;
			s.options[0] = new Option("Please select your connection type...", 0);
			s.options[1] = new Option("Dynamic IP", JS_PROTO_DHCP);
			s.options[2] = new Option("PPPoE", JS_PROTO_PPPOE);
			s.options[3] = new Option("PPTP", JS_PROTO_PPTP);
			s.options[4] = new Option("Static IP", JS_PROTO_STATIC);
			document.getElementById("conn_type_panel").style.display = "block";
			break;
		case JS_PROTO_STATIC_PPPOE_OTHER:
			s.options.length = 4;
			s.options[0] = new Option("Please select your connection type...", 0);
			s.options[1] = new Option("PPPoE", JS_PROTO_PPPOE);
			s.options[2] = new Option("Static IP", JS_PROTO_STATIC);
			s.options[3] = new Option("Other / Don't Know", JS_PROTO_UNKNOWN);
			document.getElementById("conn_type_panel").style.display = "block";
			break;
		case JS_PROTO_STATIC_DHCP_OTHER:
			s.options.length = 4;
			s.options[0] = new Option("Please select your connection type...", 0);
			s.options[1] = new Option("Dynamic IP", JS_PROTO_DHCP);
			s.options[2] = new Option("Static IP", JS_PROTO_STATIC);
			s.options[3] = new Option("Other / Don't Know", JS_PROTO_UNKNOWN);
			document.getElementById("conn_type_panel").style.display = "block";
			break;
		case JS_PROTO_PPPOE_DHCP_OTHER:
			s.options.length = 4;
			s.options[0] = new Option("Please select your connection type...", 0);
			s.options[1] = new Option("Dynamic IP", JS_PROTO_DHCP);
			s.options[2] = new Option("PPPoE", JS_PROTO_PPPOE);
			s.options[3] = new Option("Other / Don't Know", JS_PROTO_UNKNOWN);
			document.getElementById("conn_type_panel").style.display = "block";
			break;
		case JS_PROTO_PPPOE_PPTP_OTHER:
			s.options.length = 4;
			s.options[0] = new Option("Please select your connection type...", 0);
			s.options[1] = new Option("PPPoE", JS_PROTO_PPPOE);
			s.options[2] = new Option("PPTP", JS_PROTO_PPTP);
			s.options[3] = new Option("Other / Don't Know", JS_PROTO_UNKNOWN);
			document.getElementById("conn_type_panel").style.display = "block";
			break;
		case JS_PROTO_PPTP_DHCP_OTHER:
			s.options.length = 4;
			s.options[0] = new Option("Please select your connection type...", 0);
			s.options[1] = new Option("Dynamic IP", JS_PROTO_DHCP);
			s.options[2] = new Option("PPTP", JS_PROTO_PPTP);
			s.options[3] = new Option("Other / Don't Know", JS_PROTO_UNKNOWN);
			document.getElementById("conn_type_panel").style.display = "block";
			break;
	}
	return go_forward;
}
//==============================================================================
function ChangeCountry(s)
{
	if(s.options[0].value == '0') s.remove(0);
	country_modified = true;
	isp_init = false;
	ShowButtons(B_NEXT_BACK_CANCEL);
}

function ChangeISP(s)
{
	if(s.options[0].value == '0') s.remove(0);
	if(InitConnectionType())
		ShowButtons(B_NEXT_BACK_CANCEL);
	else
		ShowButtons(B_DNEXT_BACK_CANCEL);
}

function ChangeConnType(s)
{
	if(s.options[0].value == '0') s.remove(0);
	cur_conn_type = parseInt(s.value);
	ShowButtons(B_NEXT_BACK_CANCEL);
}

function SetConnType(type)
{
	cur_conn_type = type;
	ShowButtons(B_NEXT_BACK_CANCEL);
}


function check_pptp_empty()
{
	var check_value = ["pptp_serv_ip", "pptp_ip", "pptp_mask", "pptp_gw", "pptp_dns1"];
	var k, q;
	
	for(k=0; k<5; k++)
	{
		for(q=1; q<=4; q++)
		{
			if(eval("document.tF."+check_value[k]+"_"+q+".value.length <= 0"))
				return false;	
		}
	}
	
	return true;
}

function show_pptp()
{	
	var e21 = "pptp_view_pwd";
	var e22 = "pptp_username";
	var e23 = "pptp_password1";
	var e24 = "pptp_password2";		

	if(document.tF[e21].checked == true)
	{
		if( (document.tF[e22].value.length <= 0) || (document.tF[e24].value.length <= 0) || (!check_pptp_empty()) )
		{
				ShowButtons(B_DNEXT_BACK_CANCEL);	
		}
		else
		{
				ShowButtons(B_NEXT_BACK_CANCEL);
		}		
	}
	else
	{
		if( (document.tF[e22].value.length <= 0) || (document.tF[e23].value.length <= 0) || (!check_pptp_empty()) )
		{
				ShowButtons(B_DNEXT_BACK_CANCEL);	
		}
		else
		{
				ShowButtons(B_NEXT_BACK_CANCEL);
		}		
	}	

}

function check_static_empty()
{
	var check_value = ["ip", "mask", "gateway", "static_dns1"];
	var k, q;
	
	for(k=0; k<4; k++)
	{
		for(q=1; q<=4; q++)
		{
			if(eval("document.tF."+check_value[k]+"_"+q+".value.length <= 0"))
				return false;	
		}
	}
	
	return true;
}

function show_static()
{	
	if( !check_static_empty() )
	{
		ShowButtons(B_DNEXT_BACK_CANCEL);	
	}
	else
	{
		ShowButtons(B_NEXT_BACK_CANCEL);
	}		

}

function check_entry_correct(e1)
{
	var e21;
	
	if(e1 == 1)//static
	{
		e21 = "static_correct";

	}
	else if(e1 == 2)//pppoe
	{
		e21 = "pppoe_correct";
	
	}
	else if(e1 == 3)//pptp
	{
		e21 = "pptp_correct";

	}	
	
	if(document.tF[e21][0].checked == true)
	{
		ShowButtons(B_NEXT_BACK_CANCEL);			
	}
	else
	{
		ShowButtons(B_DNEXT_BACK_CANCEL);
	}	
}

function check_userpw_empty(e1)
{
	var e21;
	var e22;
	var e23;
	var e24;	
	
	if(e1 == 1)
	{
		e21 = "view_pwd";
		e22 = "username";
		e23 = "password1";
		e24 = "password2";		
	}
	else if(e1 == 2)
	{
		e21 = "pppoe_view_pwd";
		e22 = "pppoe_username";
		e23 = "pppoe_password1";
		e24 = "pppoe_password2";		
	}
	
	if(document.tF[e21].checked == true)
	{
		if( (document.tF[e22].value.length <= 0) || (document.tF[e24].value.length <= 0) )
		{
				ShowButtons(B_DNEXT_BACK_CANCEL);	
		}
		else
		{
				ShowButtons(B_NEXT_BACK_CANCEL);
		}		
	}
	else
	{
		if( (document.tF[e22].value.length <= 0) || (document.tF[e23].value.length <= 0) )
		{
				ShowButtons(B_DNEXT_BACK_CANCEL);	
		}
		else
		{
				ShowButtons(B_NEXT_BACK_CANCEL);
		}		
	}	

}

function display_pwd(e1,show)
{
	document.getElementById(e1).style.display = (show) ? "block" : "none" ;
}

function show_pwd(e1)
{
	var e21 = "";
	var e22 = "";
	var e23 = "";
	var e24 = "";
	var e25 = "";	
	
	if(e1 == 1)
	{
		e21 = "view_pwd";
		e22 = "plain_pwd";
		e23 = "obscure_pwd";
		e24 = "password1";
		e25 = "password2";		
	}
	else if(e1 == 2)
	{
		e21 = "pppoe_view_pwd";
		e22 = "plain_pppoe_pwd";
		e23 = "obscure_pppoe_pwd";
		e24 = "pppoe_password1";
		e25 = "pppoe_password2";			
	}
	else if(e1 == 3)
	{
		e21 = "pptp_view_pwd";
		e22 = "plain_pptp_pwd";
		e23 = "obscure_pptp_pwd";
		e24 = "pptp_password1";
		e25 = "pptp_password2";		
	}
		
	else if(e1 == 4)//check pppoe
	{
		e21 = "pppoe_check_view";
		e22 = "plain_chpppoe_pwd";
		e23 = "obscure_chpppoe_pwd";
	
	}
		
	
	else if(e1 == 5)//check pptp
	{
		e21 = "pptp_check_view";
		e22 = "plain_chpptp_pwd";
		e23 = "obscure_chpptp_pwd";	
	}	
		

	if((e1==1) || (e1==2) || (e1==3))
	{
		if(document.tF[e21].checked == true)
		{
			document.tF[e25].value = document.tF[e24].value;		
			display_pwd(e22, false);
			display_pwd(e23, true);
		}
		else
		{
			document.tF[e24].value = document.tF[e25].value;		
			display_pwd(e22, true);
			display_pwd(e23, false);
		}
	}
	else if((e1==4) || (e1==5))
	{
		if(document.tF[e21].checked == true)
		{
				display_pwd(e22, false);
				display_pwd(e23, true);
		}
		else
		{
				display_pwd(e22, true);
				display_pwd(e23, false);
		}		
	}

}

function ConnectOnDemand(e1)
{
	var e21;
	var e22;
	var e23;
	
	if(e1 == 2)
	{
		e21 = "pppoe_demand";
		e22 = "pppoe_timeout";
	}
	else if(e1 == 3)
	{
		e21 = "pptp_demand";
		e22 = "pptp_timeout";
	}	
		

	if(document.tF[e21].checked == true)
	{
		document.tF[e21].value == 1;
		document.tF[e22].disabled = false;		
	}
	else
	{
		document.tF[e21].value == 0;
		document.tF[e22].disabled = true;		
	}

}

function CloseWindow()
{
	if(navigator.appName=="Microsoft Internet Explorer")//only works in IE
	{
		top.window.opener=null; 
		top.window.close(); 
	}
	else
		document.location.href='status.stm';
}





function isZero(s) { 
	var i;
	var c;
	for(i=0;i<s.length;i++)
	{
		c=s.charAt(i);
		if((c!='0'))return false; 
	}
	if( i == 0 )
	{
		return false; 
	}
	return true;
}


function isValidIpAddress(address) {
   var i = 0;

   if ( address == '0.0.0.0' ||
        address == '255.255.255.255'  || address == '127.0.0.1' )
      return false;

   addrParts = address.split('.');
   if ( addrParts.length != 4 ) return false;
   for (i = 0; i < 4; i++) {
      if (isNaN(addrParts[i]))
         return false;
      num = parseInt(addrParts[i]);
      if ( num < 0 || num > 255 )
         return false;
      if( (i == 0) && ( num >= 224 && num <= 255 )){
		return false;
      }
      if( (i == 3) && ( num == 0) ){
		return false;
      }      
   }
   return true;
}


//PPTP,PPPOE,Static
<!--#include file="routine.txt" -->
<!--#exec cmd="Lan_IP_Address" --> // get LAN_IP_ADDR[], LAN_NETMASK[], LAN_SUBNET[]
<!--#exec cmd="Wan_IP_Subnet" --> // get WAN_IP_ADDR[], WAN_NETMASK[], WAN_SUBNET[]

var ipm='<!--#Fid_str_Js(641)-->';
var Gm='<!--#Fid_str_Js(395)-->';
var Gm1='<!--#Fid_str_Js(675)-->';
var sm='<!--#Fid_str_Js(766)-->';
var wanm='<!--#Fid_str_Js(1281)-->';
var ipmUcast ='<!--#Fid_str_Js(678)-->';
var lastIpError ='<!--#Fid_str_Js(1360)-->';

//DNS
var ipmLast='<!--#Fid_str_Js(675)-->';

//Static
var errorIP ='<!--#Fid_str_Js(403)-->';


var LAN_interface = new Interface_T();
var WAN_interface = new Interface_T();
<!--#exec cmd="LAN_Interface" -->
var ch;
function specialshar(s){
	var i;
	var token;
	for(i=0;i<s.length;i++){
		token = s.charAt(i);
		if(token=='`' || token=='~' || token=='!' || token=='@' || token=='#'
		|| token=='$' || token=='%' || token=='^' || token=='&' || token=='*'
		|| token=='(' || token==')' || token=='=' || token=='+' || token=='['
		|| token==']' || token=='{' || token=='}' || token=='\\' || token=='|'
		|| token==';' || token==':' || token=='\'' || token=='\"' || token=='<'
		|| token=='>' || token=='/' || token=='?' || token=='.' || token==',' ){ 
			ch = token;
			return true;
		}
	}
	return false;
}

function specialshar_name(s){
	var i;
	var token;
	for(i=0;i<s.length;i++){
		token = s.charAt(i);
		if(token=='`' || token=='~' || token=='!' || token=='#'
		|| token=='$' || token=='%' || token=='^' || token=='&' || token=='*'
		|| token=='(' || token==')' || token=='=' || token=='+' || token=='['
		|| token==']' || token=='{' || token=='}' || token=='\\' || token=='|'
		|| token==';' || token==':' || token=='\'' || token=='\"' || token=='<'
		|| token=='>' || token=='/' || token=='?' || token==',' ){ 
			ch = token;
			return true;
		}
	}
	return false;
}

function PptpDnsSubmit()
{

	var dns1 = document.tF.pptp_dns1_1.value + "." + document.tF.pptp_dns1_2.value + "." + document.tF.pptp_dns1_3.value + "." + document.tF.pptp_dns1_4.value;
	var dns2 = document.tF.pptp_dns2_1.value + "." + document.tF.pptp_dns2_2.value + "." + document.tF.pptp_dns2_3.value + "." + document.tF.pptp_dns2_4.value;
	var Specify = '<!--#Fid_str_Js(780)-->';
	var Sinvalid = '<!--#Fid_str_Js(822)-->';
	var message;
	
    //	if(document.tF.auto_from_isp.checked == false)
    	{
		if(!(isBlank_Zero(document.tF.pptp_dns1_1.value))||!(isBlank_Zero(document.tF.pptp_dns1_2.value))||!(isBlank_Zero(document.tF.pptp_dns1_3.value))||!(isBlank_Zero(document.tF.pptp_dns1_4.value))){
			if(isNValidLastIP(document.tF.pptp_dns1_1.value)) { alert(lastIpError); return false; }
			if(isNValidIP(document.tF.pptp_dns1_2.value)) { alert(ipm); return false; }
			if(isNValidIP(document.tF.pptp_dns1_3.value)) { alert(ipm); return false; }
			if(isNValidLastIP(document.tF.pptp_dns1_4.value)) { alert(ipmLast); return false; }
		}
		if(!(isBlank_Zero(document.tF.pptp_dns2_1.value))||!(isBlank_Zero(document.tF.pptp_dns2_2.value))||!(isBlank_Zero(document.tF.pptp_dns2_3.value))||!(isBlank_Zero(document.tF.pptp_dns2_4.value))){
			if(isNValidLastIP(document.tF.pptp_dns2_1.value)) { alert(lastIpError); return false; }
			if(isNValidIP(document.tF.pptp_dns2_2.value)) { alert(ipm); return false; }
			if(isNValidIP(document.tF.pptp_dns2_3.value)) { alert(ipm); return false; }
			if(isNValidLastIP(document.tF.pptp_dns2_4.value)) { alert(ipmLast); return false; }
		}
		if((isZero(document.tF.pptp_dns1_1.value)) && (isZero(document.tF.pptp_dns1_2.value)) && (isZero(document.tF.pptp_dns1_3.value)) && (isZero(document.tF.pptp_dns1_4.value))){
			alert('<!--#Fid_str_Js(707)-->');
			return false;
		}	

		if( ! isValidIpAddress(dns1)){
			alert(Specify + " " + dns1 + " " + Sinvalid);
			return false;
		}

		if((isZero(document.tF.pptp_dns2_1.value)) && (isZero(document.tF.pptp_dns2_2.value)) && (isZero(document.tF.pptp_dns2_3.value)) && (isZero(document.tF.pptp_dns2_4.value))){
			return true;
		}
	
		if( ! isValidIpAddress(dns2)){
			alert(Specify + " " + dns2 + " " + Sinvalid);
			return false;
		}
	
    	}
    	return true;	
	
}

function StaticDnsSubmit()
{
	var dns1 = document.tF.static_dns1_1.value + "." + document.tF.static_dns1_2.value + "." + document.tF.static_dns1_3.value + "." + document.tF.static_dns1_4.value;
	var dns2 = document.tF.static_dns2_1.value + "." + document.tF.static_dns2_2.value + "." + document.tF.static_dns2_3.value + "." + document.tF.static_dns2_4.value;
	var Specify = '<!--#Fid_str_Js(780)-->';
	var Sinvalid = '<!--#Fid_str_Js(822)-->';
	var message;
	
    //	if(document.tF.auto_from_isp.checked == false)
    	{
		if(!(isBlank_Zero(document.tF.static_dns1_1.value))||!(isBlank_Zero(document.tF.static_dns1_2.value))||!(isBlank_Zero(document.tF.static_dns1_3.value))||!(isBlank_Zero(document.tF.static_dns1_4.value))){
			if(isNValidLastIP(document.tF.static_dns1_1.value)) { alert(lastIpError); return false; }
			if(isNValidIP(document.tF.static_dns1_2.value)) { alert(ipm); return false; }
			if(isNValidIP(document.tF.static_dns1_3.value)) { alert(ipm); return false; }
			if(isNValidLastIP(document.tF.static_dns1_4.value)) { alert(ipmLast); return false; }
		}
		if(!(isBlank_Zero(document.tF.static_dns2_1.value))||!(isBlank_Zero(document.tF.static_dns2_2.value))||!(isBlank_Zero(document.tF.static_dns2_3.value))||!(isBlank_Zero(document.tF.static_dns2_4.value))){
			if(isNValidLastIP(document.tF.static_dns2_1.value)) { alert(lastIpError); return false; }
			if(isNValidIP(document.tF.static_dns2_2.value)) { alert(ipm); return false; }
			if(isNValidIP(document.tF.static_dns2_3.value)) { alert(ipm); return false; }
			if(isNValidLastIP(document.tF.static_dns2_4.value)) { alert(ipmLast); return false; }
		}
		if((isZero(document.tF.static_dns1_1.value)) && (isZero(document.tF.static_dns1_2.value)) && (isZero(document.tF.static_dns1_3.value)) && (isZero(document.tF.static_dns1_4.value))){
			alert('<!--#Fid_str_Js(707)-->');
			return false;
		}	

		if( ! isValidIpAddress(dns1)){
			alert(Specify + " " + dns1 + " " + Sinvalid);
			return false;
		}

		if((isZero(document.tF.static_dns2_1.value)) && (isZero(document.tF.static_dns2_2.value)) && (isZero(document.tF.static_dns2_3.value)) && (isZero(document.tF.static_dns2_4.value))){
			return true;
		}
	
		if( ! isValidIpAddress(dns2)){
			alert(Specify + " " + dns2 + " " + Sinvalid);
			return false;
		}
	
    	}
    	return true;	
	
}

function PptpSubmit() 
{
	var lanIP = document.tF.pptp_ip_1.value + "." + document.tF.pptp_ip_2.value + "." + document.tF.pptp_ip_3.value + "." + document.tF.pptp_ip_4.value;
	var lanGW = document.tF.pptp_gw_1.value + "." + document.tF.pptp_gw_2.value + "." + document.tF.pptp_gw_3.value + "." + document.tF.pptp_gw_4.value;	
	var errMsg;

	WAN_interface.ip[0] = document.tF.pptp_ip_1.value; WAN_interface.ip[1] = document.tF.pptp_ip_2.value; WAN_interface.ip[2] = document.tF.pptp_ip_3.value; WAN_interface.ip[3] = document.tF.pptp_ip_4.value;
	WAN_interface.mask[0] = LAN_interface.mask[0]; WAN_interface.mask[1] = LAN_interface.mask[1]; WAN_interface.mask[2] = LAN_interface.mask[2]; WAN_interface.mask[3] = LAN_interface.mask[3];
	WAN_interface.gateway[0] = document.tF.pptp_gw_1.value; WAN_interface.gateway[1] = document.tF.pptp_gw_2.value; WAN_interface.gateway[2] = document.tF.pptp_gw_3.value; WAN_interface.gateway[3] = document.tF.pptp_gw_4.value;

	if(isBlank(document.tF.pptp_username.value)){
		alert('<!--#Fid_str_Js(742)-->'); 
		return false;
	}
//	if(isIncludeDQuote(document.tF.pptp_username.value)||isIncludeBSlash(document.tF.pptp_username.value)||isNvaliduser(document.tF.pptp_username.value))
	{ 
		if( specialshar(document.tF.pptp_username.value)){
			alert('<!--#Fid_str_Js(648)-->'+":"+ch);
			return false; 
		}
	}
	if(isBlank(document.tF.pptp_password1.value) && isBlank(document.tF.pptp_password2.value))
	{ 	
		alert('<!--#Fid_str_Js(757)-->');  
		return false; 
	}
	/*if(specialshar(document.tF.connectionID.value)){
		alert('<!--#Fid_str_Js(648)-->'+":"+ch);
		return false; 
	}
	if(specialshar(document.tF.hostname.value)){
		alert('<!--#Fid_str_Js(648)-->'+":"+ch);
		return false; 
	}
	*/	
//	if(isIncludeDQuote(document.tF.pptp_password1.value)||isIncludeBSlash(document.tF.pptp_password1.value)||isNvaliduser(document.tF.pptp_password1.value))
	{ 
		if(specialshar(document.tF.pptp_password1.value) || specialshar(document.tF.pptp_password2.value)){
			alert('<!--#Fid_str_Js(648)-->'+":"+ch);
			return false; 
		}
	}	
	//if(isBlank(document.tF.p_passwdV.value)){ alert('<!--#Fid_str_Js(904)-->'); return false; }
	/*if(document.tF.PWV.value!=document.tF.pptp_password1.value)
	{ 
		alert('<!--#Fid_str_Js(624)-->'); 
		return false; 
	}*/
	
       if((document.tF.pptp_serv_ip_1.value=="0")&&(document.tF.pptp_serv_ip_2.value=="0")&&(document.tF.pptp_serv_ip_3.value=="0")&&(document.tF.pptp_serv_ip_4.value=="0")){
		alert('Please enter PPTP Server IP Address or Domain Name!');
		return false;		
	}
	if((document.tF.pptp_serv_ip_1.value==LAN_interface.ip[0] )&& (document.tF.pptp_serv_ip_2.value==LAN_interface.ip[1])
	&&(document.tF.pptp_serv_ip_3.value==LAN_interface.ip[2])&&(document.tF.pptp_serv_ip_4.value==LAN_interface.ip[3])){
		alert('PPTP Server IP Address can not be the same as Gateway IP Address!');
		return false;	
	}
	
	if ( document.tF.pptp_demand.checked==true ){
	       if(isNValidNum(document.tF.pptp_timeout.value) || (document.tF.pptp_timeout.value<0) || (document.tF.pptp_timeout.value>99))
		{
			alert('<!--#Fid_str_Js(738)--> '); 
			return false;
		}
	}

	if(!(isBlank_Zero(document.tF.pptp_serv_ip_1.value))||!(isBlank_Zero(document.tF.pptp_serv_ip_2.value))||!(isBlank_Zero(document.tF.pptp_serv_ip_3.value))||!(isBlank_Zero(document.tF.pptp_serv_ip_4.value))){
		if(isNValidLastIP(document.tF.pptp_serv_ip_1.value)) { alert(lastIpError); return false; }
		if(isNValidIP(document.tF.pptp_serv_ip_2.value)) { alert(ipm); return false; }
		if(isNValidIP(document.tF.pptp_serv_ip_3.value)) { alert(ipm); return false; }
		if(isNValidLastIP(document.tF.pptp_serv_ip_4.value)) { alert(lastIpError); return false; }
	}
	else
	{
		alert(ipm);
		return false;
	}

	//if(document.tF.dhcp_clt.checked==false)
	{
	
		if(!(isBlank_Zero(document.tF.pptp_ip_1.value))||!(isBlank_Zero(document.tF.pptp_ip_2.value))||!(isBlank_Zero(document.tF.pptp_ip_3.value))||!(isBlank_Zero(document.tF.pptp_ip_4.value))){
			if(isNValidLastIP(document.tF.pptp_ip_1.value)) { alert(lastIpError); return false; }
			if(isNValidIP(document.tF.pptp_ip_2.value)) { alert(ipm); return false; }
			if(isNValidIP(document.tF.pptp_ip_3.value)) { alert(ipm); return false; }
			if(isNValidLastIP(document.tF.pptp_ip_4.value)) { alert(lastIpError); return false; }
		}
		else
		{
			alert(ipm);
			return false;
		}
		if(isNValidSubnetMask( document.tF.pptp_mask_1.value, document.tF.pptp_mask_2.value, document.tF.pptp_mask_3.value, document.tF.pptp_mask_4.value )){
			alert(sm);
			return false;
		}
		if(!(isBlank_Zero(document.tF.pptp_gw_1.value))||!(isBlank_Zero(document.tF.pptp_gw_2.value))||!(isBlank_Zero(document.tF.pptp_gw_3.value))||!(isBlank_Zero(document.tF.pptp_gw_4.value))){
			if(isNValidLastIP(document.tF.pptp_gw_1.value)) { alert(lastIpError); return false; }
			if(isNValidIP(document.tF.pptp_gw_2.value)) { alert(Gm); return false; }
			if(isNValidIP(document.tF.pptp_gw_3.value)) { alert(Gm); return false; }
			if(isNValidLastIP(document.tF.pptp_gw_4.value)) { alert(lastIpError); return false; }
		}
		else
		{
			alert(Gm);
			return false;
		}
		
		if( ((document.tF.pptp_ip_1.value & LAN_NETMASK[0]) == LAN_SUBNET[0]) &&
		((document.tF.pptp_ip_2.value & LAN_NETMASK[1]) == LAN_SUBNET[1]) &&
		((document.tF.pptp_ip_3.value & LAN_NETMASK[2]) == LAN_SUBNET[2]) &&
		((document.tF.pptp_ip_4.value & LAN_NETMASK[3]) == LAN_SUBNET[3]) )
		{
			alert(wanm);
			return false;
		}		
		
		if( (document.tF.pptp_ip_1.value == 127 ) && (document.tF.pptp_ip_2.value == 0 ) && (document.tF.pptp_ip_3.value == 0 ) && (document.tF.pptp_ip_4.value == 1 ) ) { 
			errMsg = '<!--#Fid_str_Js(1241)-->'; 
			alert(errMsg); return false;
		}
		if( (document.tF.pptp_gw_1.value == 127 ) && (document.tF.pptp_gw_2.value == 0 ) && (document.tF.pptp_gw_3.value== 0 ) && (document.tF.pptp_gw_4.value == 1 ) ) { 
			errMsg = '<!--#Fid_str_Js(1243)-->'; 
			alert(errMsg); return false;
		}
		if( (document.tF.pptp_ip_1.value == document.tF.pptp_gw_1.value ) && (document.tF.pptp_ip_2.value == document.tF.pptp_gw_2.value) && 
			(document.tF.pptp_ip_3.value == document.tF.pptp_gw_3.value) && (document.tF.pptp_ip_4.value == document.tF.pptp_gw_4.value) ) { 
			errMsg ='<!--#Fid_str_Js(1243)-->'; 
			alert(errMsg); return false;
		}
	}
	
	if(!(PptpDnsSubmit()))
	{
		return false;
	}
	
	/*
	if(!(isBlank_Zero(document.tF.pptp_ip_1.value))||!(isBlank_Zero(document.tF.pptp_ip_2.value))||!(isBlank_Zero(document.tF.pptp_ip_3.value))||!(isBlank_Zero(document.tF.pptp_ip_4.value))){
		if(isNValidLastIP(document.tF.pptp_ip_1.value)) { alert(lastIpError); return false; }
		if(isNValidIP(document.tF.pptp_ip_2.value)) { alert(ipm); return false; }
		if(isNValidIP(document.tF.pptp_ip_3.value)) { alert(ipm); return false; }
		if(isNValidLastIP(document.tF.pptp_ip_4.value)) { alert(lastIpError); return false; }
	}
	else
	{
		alert(ipm);
		return false;
	}
	if(!(isBlank_Zero(document.tF.pptp_mask_1.value))||!(isBlank_Zero(document.tF.pptp_mask_2.value))||!(isBlank_Zero(document.tF.pptp_mask_3.value))||!(isBlank_Zero(document.tF.pptp_mask_4.value))){
		if(isNValidIP(document.tF.pptp_mask_1.value)) { alert(sm); return false; }
		if(isNValidIP(document.tF.pptp_mask_2.value)) { alert(sm); return false; }
		if(isNValidIP(document.tF.pptp_mask_3.value)) { alert(sm); return false; }
		if(isNValidLastMask(document.tF.pptp_mask_4.value)) { alert(sm); return false; }
	}
	else
	{
		alert(sm);
		return false;
	}
		
	if( ((document.tF.pptp_ip_1.value & LAN_NETMASK[0]) == LAN_SUBNET[0]) &&
	((document.tF.pptp_ip_2.value & LAN_NETMASK[1]) == LAN_SUBNET[1]) &&
	((document.tF.pptp_ip_3.value & LAN_NETMASK[2]) == LAN_SUBNET[2]) &&
	((document.tF.pptp_ip_4.value & LAN_NETMASK[3]) == LAN_SUBNET[3]) )
	{
		alert(wanm);
		return false;
	}		
		
	if( (document.tF.pptp_ip_1.value == 127 ) && (document.tF.pptp_ip_2.value == 0 ) && (document.tF.pptp_ip_3.value == 0 ) && (document.tF.pptp_ip_4.value == 1 ) ) { 
		errMsg = '<!--#Fid_str_Js(1241)-->'; 
		alert(errMsg); return false;
	}
	
	if( (document.tF.pptp_ip_1.value == document.tF.pptp_serv_ip_1.value ) && (document.tF.pptp_ip_2.value == document.tF.pptp_serv_ip_3.value) && 
		(document.tF.pptp_ip_3.value == document.tF.pptp_serv_ip_3.value) && (document.tF.pptp_ip_4.value == document.tF.pptp_serv_ip_4.value) ) { 
		errMsg ='<!--#Fid_str_Js(116)-->' + " " + '<!--#Fid_str_Js(62)-->'  + " " + '<!--#Fid_str_Js(1273)-->'; 
		alert(errMsg); return false;
	}
	*/
	
	return true;
}

function PppoeSubmit() 
{
	//var errMsg;
	
	if(isBlank(document.tF.pppoe_username.value))
	{
		alert('<!--#Fid_str_Js(742)-->');  
		return false; 
	}

	if( specialshar(document.tF.pppoe_username.value)){
		alert('<!--#Fid_str_Js(648)-->'+":"+ch);
		return false; 
	}
	
	if( specialshar(document.tF.pppoe_serv_name.value)){
		alert('<!--#Fid_str_Js(648)-->'+":"+ch);
		return false; 
	}

	if((isBlank(document.tF.pppoe_password1.value)) && (isBlank(document.tF.pppoe_password2.value))){ alert('<!--#Fid_str_Js(757)-->');  return false; }
	
	if ( document.tF.pppoe_demand.checked==true ){	
		if(isNValidNum(document.tF.pppoe_timeout.value) || (document.tF.pppoe_timeout.value<0) || (document.tF.pppoe_timeout.value>99))
		{	
			alert('<!--#Fid_str_Js(738)--> '); 
			return false;
		}
	}
	if(isNValidNum(document.tF.pppoe_mtu.value))
	{
		alert('<!--#Fid_str_Js(659)-->');
		return false;
	}
	if(document.tF.pppoe_mtu.value<550 || document.tF.pppoe_mtu.value>1500)
	{	
		alert('<!--#Fid_str_Js(659)-->'); 
		return false;
	}	
	document.tF.pppoe_timeout.disabled=false;
	return true;	
}

function StaticSubmit() 
{
	var i;
	var wan_ipaddress=document.tF.ip_1.value+"."+document.tF.ip_2.value+"."+document.tF.ip_3.value+"."+document.tF.ip_4.value;
	var wan_gwaddress=document.tF.gateway_1.value+"."+document.tF.gateway_2.value+"."+document.tF.gateway_3.value+"."+document.tF.gateway_4.value;
	var wan_subnetmaskaddress=document.tF.mask_1.value+"."+document.tF.mask_2.value+"."+document.tF.mask_3.value+"."+document.tF.mask_4.value;
	
	if(!(isBlank_Zero(document.tF.ip_1.value))||!(isBlank_Zero(document.tF.ip_2.value))||!(isBlank_Zero(document.tF.ip_3.value))||!(isBlank_Zero(document.tF.ip_4.value))){
		if(isNValidLastIP(document.tF.ip_1.value)) { alert(lastIpError); return false; }
		if(isNValidIP(document.tF.ip_2.value)) { alert(ipm); return false; }
		if(isNValidIP(document.tF.ip_3.value)) { alert(ipm); return false; }
		if(isNValidIP(document.tF.ip_4.value)) { alert(lastIpError); return false; }
	}
	else
	{
		alert(ipm);
		return false;
	}
	if(!(isBlank_Zero(document.tF.mask_1.value))||!(isBlank_Zero(document.tF.mask_2.value))||!(isBlank_Zero(document.tF.mask_3.value))||!(isBlank_Zero(document.tF.mask_4.value))){
		if(isNValidSubnetMask( document.tF.mask_1.value, document.tF.mask_2.value, document.tF.mask_3.value, document.tF.mask_4.value )){
			alert(sm); 
			return false;
		}		
	}
	else
	{
		alert(sm);
		return false;
	}
	if(!(isBlank_Zero(document.tF.gateway_1.value))||!(isBlank_Zero(document.tF.gateway_2.value))||!(isBlank_Zero(document.tF.gateway_3.value))||!(isBlank_Zero(document.tF.gateway_4.value))){
		if(isNValidLastIP(document.tF.gateway_1.value)) { alert(lastIpError); return false; }
		if(isNValidIP(document.tF.gateway_2.value)) { alert(Gm); return false; }
		if(isNValidIP(document.tF.gateway_3.value)) { alert(Gm); return false; }
		if(isNValidLastIP(document.tF.gateway_4.value)) { alert(lastIpError); return false; }
	}
	else
	{
		alert(Gm);
		return false;
	}

	if((wan_ipaddress=='74.41.75.200')&&(wan_gwaddress=='74.41.75.129')){
		if(wan_subnetmaskaddress=='255.255.255.248'){
			alert	(sm);
			return false;
		}
		
	}
	
	if( ((document.tF.ip_1.value & LAN_NETMASK[0]) == LAN_SUBNET[0]) &&
		((document.tF.ip_2.value & LAN_NETMASK[1]) == LAN_SUBNET[1]) &&
		((document.tF.ip_3.value & LAN_NETMASK[2]) == LAN_SUBNET[2]) &&
		((document.tF.ip_4.value & LAN_NETMASK[3]) == LAN_SUBNET[3]) )
	{
		alert(wanm);
		return false;
	}

	if( isValidIP(wan_ipaddress) == false){
		alert(errorIP);
		return false;
	}	
	
	if( 0 != isValidIPAddress3(document.tF.ip_1, document.tF.ip_2, document.tF.ip_3, document.tF.ip_4,document.tF.mask_1, document.tF.mask_2, document.tF.mask_3, document.tF.mask_4)){
		alert(errorIP);
		return false;
	}		
	
	if(!(StaticDnsSubmit()))
	{
		return false;
	}
	
	return true;	
}