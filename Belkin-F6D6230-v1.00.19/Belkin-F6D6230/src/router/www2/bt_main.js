var INACTIVE = 1;
var READY = 2;
var DOWNLOADING = 3;
var SEEDING = 4;
var PAUSED = 5;
var WAITING = 6;
var DONE = 7;

var TORRENT_NOT_RUNNING = 0
var TORRENT_RUNNING = 1
var TORRENT_START_PAUSE = 2
var TORRENT_WAITING = 3

var TORRENT_INDEX_START = 100;

var graphic_enabled = true;

var sel_task_index = 0;
var sel_row = null;

var d1 = [];
var d2 = [];

var client_dbs = new Array();
/*
client_dbs[0] = new BT_Task("Fedora 11 Preview i386 DVD", 3774873, 0, DOWNLOADING, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[1] = new BT_Task("Fedora 11 Preview i686 Live KDE", 714752, 0, DOWNLOADING, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[2] = new BT_Task("Fedora 11 Preview source DVD", 4508876, 100, SEEDING, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[3] = new BT_Task("Fedora 11 Preview x86_64 Live", 668672, 100, SEEDING, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[4] = new BT_Task("Fedora 11 Preview x86_64 Live KDE", 708608, 0, WAITING, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[5] = new BT_Task("Fedora 11 Preview ppc CDs", 4613734, 0, WAITING, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[6] = new BT_Task("Fedora 11 Preview i386 CDs", 4613756, 0, WAITING, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[7] = new BT_Task("Fedora 11 Preview x86_64 DVD", 4299161, 0, INACTIVE, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[8] = new BT_Task("Fedora 11 Preview i686 Live", 664576, 0, INACTIVE, 0, 0, 0, 0, 0, 0, -1, 0, 0);
client_dbs[9] = new BT_Task("Fedora 11 Preview x86_64 CDs", 4299120, 0, INACTIVE, 0, 0, 0, 0, 0, 0, -1, 0, 0);
*/

var torrent_dbs = new Array();

var downloading_list = new Array();
var seeding_list = new Array();
var waiting_list = new Array();
var ready_list = new Array();

var drag_index;

var int_id;

var prev_color;

var del_sel_idx = new Array();

var hash_client = -1;
var hash_torrent = -1;

var update_count = 0;

var btn_start_ebl = true;
var btn_pause_ebl = true;
var btn_stop_ebl = true;
var btn_del_ebl = true;

var folder_type = "";
var folder_name = "";

var reboot_count = 0;
var reboot_sid;

var GlobalSetting = new function()
{
	this.HEALTH_RANGE = [0, 10, 50];
	this.RefreshInterval = 5; // sec
	this.ShowDone = null;
	this.DevicePath = "/media/sda1/";
	
	this.ConcurrentDownloads = 5;
	this.AutoHideMode = 1;
	this.AutoHideSec = 86400; // sec
	this.ContentFolder = "download";
	this.TorrentFolder = "torrent";
	this.AutoDelTorrent = true;
	this.StopRatio = 0.75;
	this.StopHour = 1; // hour
	this.AutoRateControl = true;
	this.DownLimit = 50; // kbps
	this.UpLimit = 20; // kbps
}

var UILockCondition = new function()
{
	return{
		conditions: [],
		locked: false,
		
		IsLocked: function()
		{
			return this.locked;	
		},
		
		UnLock: function()
		{
			this.locked = false;
			this.Reset();
		},
			
		Reset: function()
		{
			for(var i=0;i<this.conditions.length;i++)
			{
				delete this.conditions[i];
				this.conditions[i] = null;
			}
			this.conditions.length = 0;
		},
		
		Register: function(c)
		{
			var i = this.conditions.length;
			this.conditions[i] = c;
			this.locked = true;
		},
			
		Validate: function()
		{
			for(var i=0;i<this.conditions.length;i++)
			{
				var c = this.conditions[i];
				var type = c["type"];
				
				switch(type)
				{
					case "client":
					{
						var cli = GetClientByName(c["name"]);
						if(cli)
						{
							if(cli[c["attr"]] != c["value"])
							{	
								return false;
							}
						}
						else
							return false;
						break;
					}
					case "torrent":
					{
						var t = GetTorrentByName(c["name"]);
						if(t)
						{
							if(c["value"].length)
							{
								var pass = false;
								for(var j=0;j<c["value"].length;j++)
								{
									if(t[c["attr"]] == c["value"][j])
									{	
										pass = true;
										break;
									}
								}
								if(!pass)
									return false;
							}
							else
							{
								if(t[c["attr"]] != c["value"])
								{	
									return false;
								}
							}
						}
						else
							return false;
						break;
					}
					case "torrent_no":
					{
						var count = GetValidTorrentNumber();
						if(count != c["number"])
						{
							return false;
						}
						break;
					}
					case "exist":
					{
						if(!GetTorrentByName(c["name"]))
							return false;
						break;	
					}
					case "not_exist":
					{
						if(GetTorrentByName(c["name"]))
							return false;
						break;	
					}
				}
			}
			this.UnLock();
			return true;
		}
	}
}

function BT_Task(index, name, size, done, status, seeds_c, seeds_t, peers_c, peers_t, d_speed, u_speed, eta, d_size, u_size)
{
	this.index = index;
	this.name = name;
	this.size = size;
	this.done = done;
	this.status = status;
	this.seeds_c = seeds_c;
	this.seeds_t = seeds_t;
	this.peers_c = peers_c;
	this.peers_t = peers_t;
	this.d_speed = d_speed;
	this.u_speed = u_speed;
	this.eta = eta;
	this.d_size = d_size;
	this.u_size = u_size;
	this.paused = false;
}

function Torrent(name, status, ctorrent, index, n_have, n_total, piece_size, complete, auto_hide, cannot_finish)
{
	this.name = name;
	this.status = status;
	this.ctorrent = ctorrent;
	this.index = index;
	this.n_have = n_have;
	this.n_total = n_total;
	this.piece_size = piece_size;
	this.complete = complete;
	this.auto_hide = auto_hide;
	this.cannot_finish = cannot_finish;
}

function File(name, index, n_have, n_total, size, is_download)
{
	this.name = name;
	this.index = index;
	this.n_have = n_have;
	this.n_total = n_total;
	this.size = size;
	this.is_download = is_download;	
}

function Folder(name, path)
{
	this.name = name;
	this.path = path;	
}

function UpdateGlobalSettingDialog()
{
	$("#con_down").val(GlobalSetting.ConcurrentDownloads);
		
	$("#con_slider").slider("value", GlobalSetting.ConcurrentDownloads);
	$("#auto_hide1").attr("checked", (GlobalSetting.AutoHideMode==1)?true:false);
	$("#auto_hide2").attr("checked", (GlobalSetting.AutoHideMode==0)?true:false);
	$("#auto_hide3").attr("checked", (GlobalSetting.AutoHideMode==2)?true:false);
	/* fix the IE6 radio button and checkbox issues { */
	$("#auto_hide1").attr("defaultChecked", (GlobalSetting.AutoHideMode==1)?true:false);
	$("#auto_hide2").attr("defaultChecked", (GlobalSetting.AutoHideMode==0)?true:false);
	$("#auto_hide3").attr("defaultChecked", (GlobalSetting.AutoHideMode==2)?true:false);
	/* fix the IE6 radio button and checkbox issues } */
	var a_sec = GlobalSetting.AutoHideSec;
	if(a_sec >= 86400 && (a_sec % 86400) == 0)
	{
		$("#auto_hide_t").val(a_sec / 86400);
		$("#auto_hide_u").attr("selectedIndex", 0);
	}
	else if(a_sec >= 3600 && (a_sec % 3600) == 0)
	{
		$("#auto_hide_t").val(a_sec / 3600);
		$("#auto_hide_u").attr("selectedIndex", 1);
	}
	else if(a_sec >= 60 && (a_sec % 60) == 0)
	{
		$("#auto_hide_t").val(a_sec / 60);
		$("#auto_hide_u").attr("selectedIndex", 2);
	}
	else
	{
		$("#auto_hide_t").val(a_sec);
		$("#auto_hide_u").attr("selectedIndex", 3);
	}
	$("#cont_folder").val(GlobalSetting.ContentFolder);
	$("#torr_folder").val(GlobalSetting.TorrentFolder);
	$("#auto_dis_torrent").attr("checked", (GlobalSetting.AutoDelTorrent==1)?true:false);
	/* fix the IE6 radio button and checkbox issues */
	$("#auto_dis_torrent").attr("defaultChecked", (GlobalSetting.AutoDelTorrent==1)?true:false);
	$("#ratio_slider").slider("value", GlobalSetting.StopRatio * 100);
	$("#after_slider").slider("value", GlobalSetting.StopHour * 10);
	$("#auto_rate").attr("checked", (GlobalSetting.AutoRateControl==1)?true:false);
	/* fix the IE6 radio button and checkbox issues */
	$("#auto_rate").attr("defaultChecked", (GlobalSetting.AutoRateControl==1)?true:false);
	$("#down_rate").val(GlobalSetting.DownLimit);
	$("#up_rate").val(GlobalSetting.UpLimit);
	
	DoAutoHideOption();
	DoAutoRateOption();
	DoConDownLabel($("#con_slider").slider("value"));
	DoStopRatioLabel($("#ratio_slider").slider("value"));
	DoStopAfterLabel($("#after_slider").slider("value"));
}

function GetGlobalSetting()
{
	$.get("GETCONFIG", {sid: Math.random()}, function(data){
		//console.log(data);
		var d = data.split("\t");
		GlobalSetting.ConcurrentDownloads = parseInt(d[0]);
		GlobalSetting.AutoHideMode = parseInt(d[1]);
		GlobalSetting.AutoHideSec = parseInt(d[2]);
		GlobalSetting.ContentFolder = d[3];
		GlobalSetting.TorrentFolder = d[4];
		GlobalSetting.AutoDelTorrent = (d[5]=="1")?true:false;
		GlobalSetting.StopRatio = parseFloat(d[6]);
		GlobalSetting.StopHour = parseInt(d[7]);
		GlobalSetting.AutoRateControl = (d[8]=="1")?true:false;
		GlobalSetting.DownLimit = parseInt(d[9]);
		GlobalSetting.UpLimit = parseInt(d[10]);
		GlobalSetting.DevicePath = d[11];
		
		UpdateGlobalSettingDialog();
	});
}

function SetGlobalSetting(need_restart)
{
	$.get("SETCONFIG", {
		cd: GlobalSetting.ConcurrentDownloads,
		ahm: GlobalSetting.AutoHideMode,
		ahs: GlobalSetting.AutoHideSec,
		cf: GlobalSetting.ContentFolder,
		tf: GlobalSetting.TorrentFolder,
		adt: GlobalSetting.AutoDelTorrent,
		sr: GlobalSetting.StopRatio,
		sh: GlobalSetting.StopHour,
		arc: GlobalSetting.AutoRateControl,
		dl: GlobalSetting.DownLimit,
		ul: GlobalSetting.UpLimit,
		sid: Math.random()
	}, function(data){
		HideProceeding();
		if(need_restart)
		{
			reboot_count = 60;
			$('#message_dlg').parent().find('.ui-dialog-buttonpane').hide();
			$('#message_dlg').parent().find('.ui-dialog-titlebar').hide();
			$('#message_dlg').parent().find('.icon').hide();
			ShowMessage("Applying changes. Please wait......." + "<br>" + reboot_count + " " + "seconds remaining.");
			$('#message_dlg').css("min-height", "40px");
			reboot_sid = setInterval("ShowReboot()", 1000);
		}
	});
}

function ShowReboot()
{
	if(reboot_count <= 0)
	{
		$('#message_dlg').dialog('close');
		$('#message_dlg').parent().find('.ui-dialog-buttonpane').show();
		$('#message_dlg').parent().find('.ui-dialog-titlebar').show();
		$('#message_dlg').parent().find('.icon').show();
		clearInterval(reboot_sid);
	}
	else
	{
		reboot_count--;
		ShowMessage("Applying changes. Please wait......." + "<br>" + reboot_count + " " + "seconds remaining.");
	}
}

function DoAutoHideOption()
{
	var c = $("#auto_hide1").attr("checked");
	$("#auto_hide_t").attr("disabled", !c);
	$("#auto_hide_u").attr("disabled", !c);
}

function DoAutoRateOption()
{
	var c = $("#auto_rate").attr("checked");
	$("#down_rate").attr("disabled", c);
	$("#up_rate").attr("disabled", c);
}

function DoConDownLabel(v)
{
	$("#con_msg").html("<b>"+ v + "</b> " + "items at a time");
}

function DoStopRatioLabel(v)
{
	if(v == 125)
		$("#ratio_msg").html("Never");
	else
		$("#ratio_msg").html("<b>"+ v/100 + "/1</b> up/down");
}

function DoStopAfterLabel(v)
{
	$("#after_msg").html("<b>"+ v/10 + "</b> " + "hour(s)");
}	

function InitOptionDialog()
{
	GetGlobalSetting();
	
	$('#g_setting_dlg').dialog({
		autoOpen: false,
		width: 600,
		modal: true,
		buttons: {
			"Cancel": function() {
				UpdateGlobalSettingDialog();
				$(this).dialog("close");
			},
			"Ok": function() {
				var v = $("#auto_hide_t").val();
				if(v.match(/\D/)!=null)
				{
					ShowMessage("Invalid number" + ": " + v);
					return;
				}
				if(v == "" || parseInt(v) <= 0 || parseInt(v) > 99)
				{
					ShowMessage("Invalid number" + ": " + v + ". " + "The number should be between 1 and 99.");
					return;
				}
				if($("#auto_rate").attr("checked") == false)
				{
					v = $("#down_rate").val();
					if(v.match(/\D/)!=null)
					{
						ShowMessage("Invalid number" + ": " + v);
						return;
					}
					if(v == "" || parseInt(v) <= 0 || parseInt(v) > 512)
					{
						ShowMessage("Invalid number" + ": " + v + ". " + "The number should be between 1 and 512.");
						return;
					}
					v = $("#up_rate").val();
					if(v.match(/\D/)!=null)
					{
						ShowMessage("Invalid number" + ": " + v);
						return;
					}
					if(v == "" || parseInt(v) <= 0 || parseInt(v) > 128)
					{
						ShowMessage("Invalid number" + ": " + v + ". " + "The number should be between 1 and 128.");
						return;
					}
				}
				if($("#cont_folder").val() == "" || $("#torr_folder").val() == "")
				{
					ShowMessage("Invalid folder, it is a null path");
					return;
				}
				
				var need_restart = false;
				if(GlobalSetting.ConcurrentDownloads != $("#con_slider").slider("value"))
					need_restart = true;
				if(GlobalSetting.ContentFolder != $("#cont_folder").val())
					need_restart = true;
				if(GlobalSetting.TorrentFolder != $("#torr_folder").val())
					need_restart = true;
				
				GlobalSetting.ConcurrentDownloads = $("#con_slider").slider("value");
				if($("#auto_hide1").attr("checked"))
					GlobalSetting.AutoHideMode = 1;
				else if($("#auto_hide2").attr("checked"))
					GlobalSetting.AutoHideMode = 0;
				else
					GlobalSetting.AutoHideMode = 2;
				if(GlobalSetting.AutoHideMode == 1)
					GlobalSetting.AutoHideSec = $("#auto_hide_t").val() * $("#auto_hide_u").val();
				GlobalSetting.ContentFolder = $("#cont_folder").val();
				GlobalSetting.TorrentFolder = $("#torr_folder").val();
				GlobalSetting.AutoDelTorrent = $("#auto_dis_torrent").attr("checked")?1:0;
				GlobalSetting.StopRatio = $("#ratio_slider").slider("value") / 100;
				GlobalSetting.StopHour = $("#after_slider").slider("value") / 10;
				GlobalSetting.AutoRateControl = $("#auto_rate").attr("checked")?1:0;
				GlobalSetting.DownLimit = $("#down_rate").val();
				GlobalSetting.UpLimit = $("#up_rate").val();
				
				SetGlobalSetting(need_restart);
				$(this).dialog("close");
				ShowProceeding();
				
				/* fix the IE6 radio button and checkbox issues */
				UpdateGlobalSettingDialog();
			}
		}
	});

	$("#auto_hide1").click(function(){
		DoAutoHideOption();
	});

	$("#auto_hide2").click(function(){
		DoAutoHideOption();
	});
	
	$("#auto_hide3").click(function(){
		DoAutoHideOption();
	});

	$("#auto_rate").click(function(){
		DoAutoRateOption();
	});
	
	$("#con_slider").slider({
		value: 3,
		min: 1,
		max: 5,
		step: 1,
		slide: function(event, ui) {
			DoConDownLabel(ui.value);
		}
	});

	$("#ratio_slider").slider({
		value: 75,
		min: 0,
		max: 125,
		step: 25,
		slide: function(event, ui) {
			DoStopRatioLabel(ui.value);
		}
	});

	$("#after_slider").slider({
		value: 10,
		min: 0,
		max: 120,
		step: 10,
		slide: function(event, ui) {
			DoStopAfterLabel(ui.value);
		}
	});
}

function Init()
{
	$(function(){
		$(".myMenu").buildMenu(
		{
			//template:"menuVoices.html",
			additionalData:"pippo=1",
			menuWidth:100,
			openOnRight:false,
			menuSelector: ".menuContainer",
			containment:"wrapper",
			iconPath:"ico/",
			hasImages:false,
			fadeInTime:0,
			fadeOutTime:300,
			adjustLeft:2,
			minZindex:"auto",
			adjustTop:10,
			opacity:1,
			shadow:false,
			closeOnMouseOut:true,
			closeAfter:1000
		});
	});

	$('#check_all').click(function() {
		$('#task_list_table :checkbox:visible').attr("checked", this.checked);
		
	});

	/*
	$("#cont_folder").click(function(){
		$("#browse_content").click();
	});
	
	$("#torr_folder").click(function(){
		$("#browse_torrent").click();
	});
	*/

	$("#browse_content").click(function(){
		OpenFolderDialog(GlobalSetting.DevicePath + $("#cont_folder").val(), "content");
	});
	
	$("#browse_torrent").click(function(){
		OpenFolderDialog(GlobalSetting.DevicePath + $("#torr_folder").val(), "torrent");
	});

	$(".btn1").hover(
		function () {
			$(this).attr("className", "btn1_over");
		}, 
		function () {
			$(this).attr("className", "btn1");
		}
	);

	$(".btn2").hover(
		function () {
			$(this).attr("className", "btn2_over");
		}, 
		function () {
			$(this).attr("className", "btn2");
		}
	);

	$(".btn3").hover(
		function () {
			$(this).attr("className", "btn3_over");
		}, 
		function () {
			$(this).attr("className", "btn3");
		}
	);

	$(".btn4").hover(
		function () {
			$(this).attr("className", "btn4_over");
		}, 
		function () {
			$(this).attr("className", "btn4");
		}
	);

	$(".pref").hover(
		function () {
			$(this).addClass("pref_over");
		}, 
		function () {
			$(this).removeClass("pref_over");
		}
	);

	// Dialog
	InitOptionDialog();
	
	$('#folder_dlg').dialog({
		autoOpen: false,
		width: 600,
		modal: true,
		buttons: {
			"Ok": function() {
				folder_name = folder_name.substring(GlobalSetting.DevicePath.length);
				if(folder_type == "content")
					$("#cont_folder").val(folder_name);
				else
					$("#torr_folder").val(folder_name);
				$(this).dialog("close");
			}
		}
	});
				
	$('#t_setting_dlg').dialog({
		autoOpen: false,
		width: 700,
		modal: true,
		buttons: {
			"Ok": function() {
				$(this).dialog("close");
			}
		}
	});

	$('#add_task_dlg').dialog({
		autoOpen: false,
		width: 450,
		modal: true,
		buttons: {
			"Cancel": function() { 
				$(this).dialog("close");
			},
			"Submit": function() {
				var file = $("#upload_file").val();
				var pos;
				var ff;
				if((pos = file.lastIndexOf("\\")) != -1)
				{
					file = file.substring(pos+1, file.length);
				}
				ff = file.split(".");
				if(!file || file == "" || ff.length < 2 || ff[0] == "" || ff[ff.length-1] != "torrent")
				{
					ShowMessage("Please choose a .torrent file to submit.");
				}
				else if(GetTorrentByName(file))
				{
					ShowMessage("The file was submitted: \"" + file + "\".");
				}
				else
				{
					$("#upload_form").submit();
					ShowProceeding();
					UILockCondition.Register({type: "torrent_no", number: GetValidTorrentNumber()+1});
					$(this).dialog("close");
				}
			}
		}
	});

	$('#message_dlg').dialog({
		autoOpen: false,
		width: 300,
		modal: true,
		buttons: {
			"OK": function() {
				$(this).dialog("close");
			}
		}
	});

	$('#delete_dlg').dialog({
		autoOpen: false,
		width: 750,
		modal: true,
		buttons: {
			"Cancel": function() {
				$(this).dialog("close");
			},
			"Delete torrent only (prevent further downloading/uploading)": function() {
				DeleteTorrentFile(false);
				GetClientsInfo();
				$(this).dialog("close");
			},
			"Delete torrent and file": function() {
				DeleteTorrentFile(true);
				GetClientsInfo();
				$(this).dialog("close");
			}
		}
	});

	$('#g_setting_btn').click(function() {
		$('#g_setting_dlg').dialog('open');
	});

	// tooltip
	$('#btn_add_task').tooltip({
		track: true,
		delay: 1000,
		showURL: false,
		showBody: " - ",
		fixPNG: true,
		extraClass: "pretty",
		top: -15,
		left: 5
	});

	$('#btn_start_task').tooltip({
		track: true,
		delay: 1000,
		showURL: false,
		showBody: " - ",
		fixPNG: true,
		extraClass: "pretty",
		top: -15,
		left: 5
	});

	$('#btn_pause_task').tooltip({
		track: true,
		delay: 1000,
		showURL: false,
		showBody: " - ",
		fixPNG: true,
		extraClass: "pretty",
		top: -15,
		left: 5
	});

	$('#btn_stop_task').tooltip({
		track: true,
		delay: 1000,
		showURL: false,
		showBody: " - ",
		fixPNG: true,
		extraClass: "pretty",
		top: -15,
		left: 5
	});

	$('#btn_delete_task').tooltip({
		track: true,
		delay: 1000,
		showURL: false,
		showBody: " - ",
		fixPNG: true,
		extraClass: "pretty",
		top: -15,
		left: 5
	});
		
	//GraphInit();

	GetClientsInfo();
	int_id = setInterval("GetClientsInfo()", GlobalSetting.RefreshInterval * 1000);
}

function DeleteTorrentFile(do_delete_file)
{
	for(var i=0;i<del_sel_idx.length;i++)
	{
		var torrent_idx = del_sel_idx[i];
		var client_idx = GetClientIdxByName(GetTorrentByIdx(torrent_idx).name);
			
		if(do_delete_file)
			$.get("TORRENTDELETE", {index: torrent_idx, del: 1, sid: Math.random()});
		else
			$.get("TORRENTDELETE", {index: torrent_idx, del: 0, sid: Math.random()});
		
		if(client_idx != -1 && client_idx < TORRENT_INDEX_START)
			$.get("CLIENTQUIT", {index: client_idx, sid: Math.random()});
		
		ShowProceeding();
		UILockCondition.Register({type: "not_exist", name: GetTorrentByIdx(torrent_idx).name});
	}
}

function ParseClientInfo(data)
{
	var ds = data.split('\n');
	var d;
	var t;
	var down_count = 0;
	for(var i=0;i<client_dbs.length;i++)
	{
		t = client_dbs[i];
		t.status = INACTIVE;
		t.name = "";
	}
	
	for(var i=0;i<ds.length;i++)
	{
		if(ds[i] == "") break;
		
		if(ds[i].indexOf("hash=") == 0)
		{
			return parseInt(ds[i].substr(5, ds[i].length-5));
		}
		
		d = ds[i].split('\t');
		t = client_dbs[i];
		
		if(!t)
		{
			t = new BT_Task(0, "", 0, 0, INACTIVE, 0, 0, 0, 0, 0, 0, -1, 0, 0);
			client_dbs[i] = t;
		}
		t.index = parseInt(d[9]);
		t.name = d[0];
		t.size = parseInt(d[4]);
		t.seeds_c = parseInt(d[2]);
		t.seeds_t = parseInt(d[2]);
		t.peers_c = parseInt(d[3]);
		t.peers_t = parseInt(d[3]);
		t.d_speed = parseInt(d[5]);
		t.u_speed = parseInt(d[6]);
		t.eta = -1;
		t.d_size = parseInt(d[7]);
		t.u_size = parseInt(d[8]);
		//t.done = TrimFloat(t.d_size / t.size * 100);
		var done = TrimFloat(parseInt(d[12]) * parseInt(d[14]) / t.size * 100);
		if(done >= 100)
		{
			if(t.done == 200)
			{
				t.done = 100;
				hash_client = -1;
			}
			else if(t.done < 100)
				t.done = 200;
		}
		else
		{
			if(!done) done = 0;
			t.done = done;
		}

		t.paused = (d[15]==1)?true:false;
		if(t.done >= 100 && t.done != 200)
			t.status = SEEDING;
		else
			t.status = DOWNLOADING;
		//else if(down_count <= GlobalSetting.ConcurrentDownloads)
		//	t.status = DOWNLOADING;
		//else
		//	t.status = WAITING;
	}
}

function ParseTorrentInfo(data)
{
	var ds = data.split('\n');
	var d;
	var t;
	
	for(var i=0;i<torrent_dbs.length;i++)
	{
		t = torrent_dbs[i];
		t.name = "";
	}
	
	for(var i=0;i<ds.length;i++)
	{
		if(ds[i] == "") break;
		
		if(ds[i].indexOf("hash=") == 0)
		{
			return parseInt(ds[i].substr(5, ds[i].length-5));
		}
		
		d = ds[i].split('\t');
		t = torrent_dbs[i];
		
		if(!t)
		{
			t = new Torrent("", 0, 0, 0, 0, 0, 0, 0, 0, 0);
			torrent_dbs[i] = t;
		}
		t.name = d[0];
		t.status = parseInt(d[1]);
		t.ctorrent = parseInt(d[2]);
		t.index = parseInt(d[3]);
		t.n_have = parseInt(d[4]);
		t.n_total = parseInt(d[5]);
		t.piece_size = parseInt(d[6]);
		t.complete = parseInt(d[7]);
		t.auto_hide = parseInt(d[8]);
		t.cannot_finish = parseInt(d[9]);
	}
}

function ParseFileInfo(data)
{
	var ds = data.split('\n');
	var d;
	var f = new Array();
	var fi = 0;
	
	for(var i=1;i<ds.length;i++)
	{
		if(ds[i] == "") continue;
		
		d = ds[i].split('\t');
		
		if(i==1)
		{
			f[fi] = new File(d[0], -1, 0, 0, 0, 0);
		}
		else
		{
			f[fi] = new File(d[0], parseInt(d[1]), parseInt(d[2]), parseInt(d[3]), parseInt(d[4]), parseInt(d[5]));
		}

		fi++;
	}
	
	return f;
}

function SwapFolder(f1, f2)
{
	var t = new Folder(f1.name, f1.path);
	f1.name = f2.name;
	f1.path = f2.path;
	f2.name = t.name;
	f2.path = t.path;
}

function ParseFolderInfo(data)
{
	var ds = data.split('\n');
	var d;
	var f = new Array();
	var sort_f = new Array();
	var min;
	var min_name;
	var fi = 0;
	
	for(var i=0;i<ds.length;i++)
	{
		if(ds[i] == "") continue;
		
		d = ds[i].split('\t');
		
		if(d[0] == ".") continue;
		if(folder_name == GlobalSetting.DevicePath && d[0] == "..") continue;
		
		f[fi] = new Folder(d[0], d[1]);
		fi++;
	}
	
	for(var i=0;i<f.length;i++)
	{
		for(var j=i;j<f.length;j++)
		{
			if(j==i)
			{
				min = j;
				min_name = f[j].name;
			}
			else if(f[j].name < min_name)
			{
				min = j;
				min_name = f[j].name;
			}
		}
		SwapFolder(f[i], f[min]);
	}
	return f;
}

function UpdateDownloadingList()
{
	for(var i=0;i<torrent_dbs.length;i++)
	{
		var t = torrent_dbs[i];
		if(t.status == TORRENT_RUNNING && !GetClientByName(t.name))
		{
			var idx = FindEmptySlotFromClientDbs();
			var c = client_dbs[idx];
			if(c)
			{
				c.name = t.name;
				c.status = DOWNLOADING;
				c.index = torrent_dbs[i].index+TORRENT_INDEX_START;
				c.done = 0;
				c.paused = false;
			}
			else
			{
				c = new BT_Task(torrent_dbs[i].index+TORRENT_INDEX_START, t.name, 0, 0, DOWNLOADING, 0, 0, 0, 0, 0, 0, -1, 0, 0);
				client_dbs[idx] = c;
			}
		}
	}
}

function UpdateWaitingTask()
{
	for(var i=0;i<torrent_dbs.length;i++)
	{
		var t = torrent_dbs[i];
		if(!t.name || t.name == "") continue;
		
		var ci;
		if((ci = GetClientIdxByName(t.name)) == -1 || GetClientByName(t.name).status == INACTIVE )
		{
			var idx = FindEmptySlotFromClientDbs();
			var c_status;
			if(torrent_dbs[i].status == TORRENT_WAITING)
				c_status = WAITING;
			else
				c_status = READY;
			
			c = client_dbs[idx];
			if(c)
			{
				c.name = t.name;
				c.status = c_status;
				c.index = torrent_dbs[i].index+TORRENT_INDEX_START;
			}
			else
			{
				c = new BT_Task(torrent_dbs[i].index+TORRENT_INDEX_START, t.name, 0, 0, c_status, 0, 0, 0, 0, 0, 0, -1, 0, 0);
				client_dbs[idx] = c;
			}
		}
	}	
}

function GetValidTorrentNumber()
{
	var count = 0;
	for(var i=0;i<torrent_dbs.length;i++)
		if(torrent_dbs[i].name && torrent_dbs[i].name != "")
			count++;
	
	return count;
}

function GetStartedClientCount()
{
	var c = 0;
	for(var i=0;i<client_dbs.length;i++)
	{
		if(client_dbs[i].name != "" && client_dbs[i].status == DOWNLOADING || client_dbs[i].status == SEEDING || client_dbs[i].status == WAITING)
			c++;
	}
	return c;
}

function GetPausedClientCount()
{
	var c = 0;
	for(var i=0;i<client_dbs.length;i++)
	{
		if(client_dbs[i].name != "" && (client_dbs[i].status == DOWNLOADING || client_dbs[i].status == SEEDING) && client_dbs[i].paused)
			c++;
	}
	return c;
}

function GetStopedClientCount()
{
	var c = 0;
	for(var i=0;i<torrent_dbs.length;i++)
	{
		if(torrent_dbs[i].name != "" && torrent_dbs[i].status == TORRENT_NOT_RUNNING)
			c++;
	}
	return c;
}

function FindEmptySlotFromClientDbs()
{
	for(var i=0;i<client_dbs.length;i++)
	{
		if(client_dbs[i].status == INACTIVE) return i;
	}
	return client_dbs.length;
}

function GetTorrentIdxByName(name)
{
	/*
	for(var i=0;i<torrent_dbs.length;i++)
	{
		if(torrent_dbs[i].name == name) return torrent_dbs[i].index;
	}
	return -1;
	*/
	var t = GetTorrentByName(name);
	if(t)
		return t.index;
	else
		return -1;
}

function GetTorrentByName(name)
{
	for(var i=0;i<torrent_dbs.length;i++)
	{
		if(torrent_dbs[i].name == name) return torrent_dbs[i];
	}
	return null;
}

function GetTorrentByIdx(index)
{
	for(var i=0;i<torrent_dbs.length;i++)
	{
		if(torrent_dbs[i].index == index) return torrent_dbs[i];
	}
	return null;
}

function GetClientIdxByName(name)
{
	/*
	for(var i=0;i<client_dbs.length;i++)
	{
		if(client_dbs[i].name == name) return i;
	}
	return -1;
	*/
	var c = GetClientByName(name);
	if(c)
		return c.index;
	else
		return -1;
}

function GetClientByName(name)
{
	for(var i=0;i<client_dbs.length;i++)
	{
		if(client_dbs[i].name == name) return client_dbs[i];
	}
	return null;
}

function GetClientByIdx(index)
{
	for(var i=0;i<client_dbs.length;i++)
	{
		if(client_dbs[i].index == index) return client_dbs[i];
	}
	return null;
}

function DisableButtons()
{
	if(GetPausedClientCount() == 0 && GetStopedClientCount() == 0)
	{
		if(btn_start_ebl)
		{
			$("#btn_start_task").unbind("mouseenter").unbind("mouseleave").attr("className", "btn2_gray");
			btn_start_ebl = false;
		}
	}
	else
	{
		if(!btn_start_ebl)
		{
			$("#btn_start_task").hover(
				function () {$(this).attr("className", "btn2_over");}, 
				function () {$(this).attr("className", "btn2");}
			).attr("className", "btn2");
			btn_start_ebl = true;
		}
	}
	if(GetStartedClientCount() == GetPausedClientCount())
	{
		if(btn_pause_ebl)
		{
			$("#btn_pause_task").unbind("mouseenter").unbind("mouseleave").attr("className", "btn3_gray");
			btn_pause_ebl = false;
		}
	}
	else
	{
		if(!btn_pause_ebl)
		{
			$("#btn_pause_task").hover(
				function () {$(this).attr("className", "btn3_over");}, 
				function () {$(this).attr("className", "btn3");}
			).attr("className", "btn3");
			btn_pause_ebl = true;
		}
	}
	if(GetStartedClientCount() == 0 && GetPausedClientCount() == 0)
	{
		if(btn_stop_ebl)
		{
			$("#btn_stop_task").unbind("mouseenter").unbind("mouseleave").attr("className", "btn3_gray");
			btn_stop_ebl = false;
		}
	}
	else
	{
		if(!btn_stop_ebl)
		{
			$("#btn_stop_task").hover(
				function () {$(this).attr("className", "btn3_over");}, 
				function () {$(this).attr("className", "btn3");}
			).attr("className", "btn3");
			btn_stop_ebl = true;
		}
	}
	if(GetValidTorrentNumber() == 0)
	{
		if(btn_del_ebl)
		{
			$("#btn_delete_task").unbind("mouseenter").unbind("mouseleave").attr("className", "btn4_gray");
			btn_del_ebl = false;
		}
	}
	else
	{
		if(!btn_del_ebl)
		{
			$("#btn_delete_task").hover(
				function () {$(this).attr("className", "btn4_over");}, 
				function () {$(this).attr("className", "btn4");}
			).attr("className", "btn4");
			btn_del_ebl = true;
		}
	}
}

function GetClientsInfo()
{
	$.get("GETTORRENTS", {sid: Math.random()}, function(data){
		//console.log(data);
		var hash = ParseTorrentInfo(data);
		//console.log("hash of torrent="+hash_torrent+"/"+hash);
		if(hash_torrent != hash)
		{
			hash_client = -1;
			hash_torrent = hash;
		}
		
		$.get("GETCLIENTSINFO", {sid: Math.random()}, function(data){
			//console.log(data);
			var hash = ParseClientInfo(data);
			//console.log("hash of client="+hash_client+"/"+hash);
			//console.log("-----------------------");
			if(hash_client != hash)
			{
				UpdateDownloadingList();
				UpdateWaitingTask();
				UpdateAllList(true);
				hash_client = hash;
				$("#check_all").attr("checked", false);
			}
			else
			{
				UpdateWaitingTask();
				UpdateAllList(false);
			}
			
			if(UILockCondition.IsLocked())
			{
				if(UILockCondition.Validate())
					HideProceeding();
			}
			
			if(update_count != -1)
			{
				if(update_count < 1)
				{
					update_count++;
				}
				else
				{
					HideProceeding();
					update_count = -1;
				}
			}
			
			DisableButtons();
		});
	});
}

function IsReachMaxDownload()
{
	var count = 0;
	
	for(var i=0;i<client_dbs.length;i++)
	{
		if(client_dbs[i].status == SEEDING || client_dbs[i].status == DOWNLOADING)
			count++;
	}
	
	if(count >= GlobalSetting.ConcurrentDownloads)
		return true;
	else
		return false;
}

function UpdateList(list, status)
{
	var j = 0;
	
	list.length = 0;
	
	for(var i=0;i<client_dbs.length;i++)
	{
		if(client_dbs[i].status == status)
		{
			/*if(status == DOWNLOADING)
			{
				if(j < GlobalSetting.ConcurrentDownloads)
					list[j++] = client_dbs[i];
				else
				{
					client_dbs[i].status = WAITING;
					j++;
				}
			}
			else
			*/
			/*
			if(status == WAITING)
			{
				if(j + downloading_list.length >= GlobalSetting.ConcurrentDownloads)
					list[j++] = client_dbs[i];
				else
				{
					client_dbs[i].status = DOWNLOADING;
					UpdateList(downloading_list, DOWNLOADING);
				}
			}
			else
			{
				list[j++] = client_dbs[i];
			}
			*/
			list[j++] = client_dbs[i];
		}
	}
	
	/*
	if(status2)
	{
		for(var i=0;i<client_dbs.length;i++)
			if(client_dbs[i].status == status2)
				list[j++] = client_dbs[i];
	}
	*/
}

function UpdateAllList(create)
{
	UpdateList(downloading_list, DOWNLOADING);
	UpdateList(seeding_list, SEEDING);
	UpdateList(waiting_list, WAITING);
	UpdateList(ready_list, READY);

	if(create)
		RefreshTaskList("task_list_table", "CREATE");
	else
		RefreshTaskList("task_list_table", "UPDATE");
}
/*
function UpdateTaskData(list, d)
{
	for(var i=0;i<list.length;i++)
	{
		var task = list[i];
		task.seeds_c = d[i].seeds_c;
		task.seeds_t = d[i].seeds_t;
		task.peers_c = d[i].peers_c;
		task.peers_t = d[i].peers_t;
		task.d_speed = d[i].d_size - task.d_size;
		task.u_speed = d[i].u_size - task.u_size;
		if(d[i].d_size >= task.size)
		{
			task.d_size = task.size;
			if(task.status != SEEDING && task.status != READY && task.status != PAUSED)
			{
				task.status = SEEDING;
				if(waiting_list.length > 0 && !IsDownloadingFull())
					waiting_list[0].status = DOWNLOADING;

				UpdateAllList(true);
			}
			task.eta = 0;
		}
		else
		{
			task.d_size = d[i].d_size;
			task.eta = Math.round((task.size - task.d_size) / task.d_speed);
		}
		task.u_size = d[i].u_size;
		task.done = TrimFloat(task.d_size / task.size * 100);

	}
}

function UpdateSimulate()
{
	var UpdateList = function(list)
	{
		var d = new Array(list.length);
		for(var i=0;i<list.length;i++)
		{
			var task = list[i];
			var seeds_c;
			var seeds_t;
			var peers_c;
			var peers_t;
			
			if(task.status == DOWNLOADING || task.status == SEEDING)
			{
				seeds_c = task.seeds_c + RandomNumber(-1, 3);
				if(seeds_c < 0) seeds_c = 0;
				seeds_t = seeds_c + RandomNumber(0, 10);
				peers_c = task.peers_c + RandomNumber(-1, 3);
				if(peers_c < 0) peers_c = 0;
				peers_t = peers_c + RandomNumber(0, 10);
			}
			else if(task.status == PAUSED)
			{
				seeds_c = task.seeds_c;
				seeds_t = task.seeds_t;
				peers_c = task.peers_c;
				peers_t = task.peers_t;
			}
			else
			{
				seeds_c = 0;
				seeds_t = 0;
				peers_c = 0;
				peers_t = 0;
			}
			
			var speed = $("s_down_speed").value;
			var f = RandomNumber(50, 100);
			//var f = RandomNumber(speed-5, speed+5);
			var d_size;
			var u_size;
			var ds = task.d_speed + RandomNumber(-f*10, f*20);
			var us = task.u_speed + RandomNumber(-f*4, f*8);
			if(ds < 0) ds = 1;
			if(us < 0) us = 1;
			
			if(task.status == DOWNLOADING)
			{
				d_size = task.d_size + ds;
				u_size = task.u_size + us;
			}
			else if(task.status == SEEDING)
			{
				d_size = task.d_size;
				if(task.u_size / task.size < GlobalSetting.UPLOADING_RATIO)
					u_size = task.u_size + us;
				else
					u_size = task.u_size;
			}
			else if(task.status == PAUSED || task.status == READY)
			{
				d_size = task.d_size;
				u_size = task.u_size;
			}
					
			d[i] = new TaskTransData(seeds_c, seeds_t, peers_c, peers_t, d_size, u_size);
		}
		
		UpdateTaskData(list, d);
	}
	
	UpdateList(downloading_list);
	UpdateList(seeding_list);
	
	RefreshTaskList("task_list_table", "UPDATE");
	
	//UpdateGraph();
}

function TaskTransData(seeds_c, seeds_t, peers_c, peers_t, d_size, u_size)
{
	this.seeds_c = seeds_c;
	this.seeds_t = seeds_t;
	this.peers_c = peers_c;
	this.peers_t = peers_t;
	this.d_size = d_size;
	this.u_size = u_size; 
}
*/

function RandomNumber(min, max)
{
	//return Math.floor(Math.random()*max+1) + (from-1);
	return Math.floor(Math.random()*(max-min+1)+min);
}

function TransSizeUnit(size)
{
	if(size >= 1000 * 1024 * 1024)
		return TrimFloat(size / 1024 / 1024 / 1024) + " GB";
	else if(size >= 1000 * 1024)
		return TrimFloat(size / 1024 / 1024) + " MB";
	else if(size >= 1000)
		return TrimFloat(size / 1024) + " KB";
	else
		return TrimFloat(size) + " Bytes";
}

function TransTimeUnit(sec)
{
	if(sec == Infinity || sec < 0)
		return "Inf.";
	
	if(sec == 0)
		return "";

	var time = "";

	var d = Math.floor(sec / 86400);
	var h = Math.floor((sec % 86400) / 3600);
	var m = Math.floor((sec - 86400 * d - 3600 * h) / 60);
	var s = sec - 86400 * d - 3600 * h - 60 * m;

	if(d != 0)
		time += d + "d ";
	if(h != 0)
		time += h + "h ";
	if(m != 0)
		time += m + "m ";
	if(s != 0)
		time += s + "s";

	return time;
}

function TrimName(name, s)
{
	return name.substring(0, name.lastIndexOf(s));
}

function TrimTorrentName(name)
{
	return TrimName(name, ".torrent");
}

function TrimFloat(f)
{
	return Math.round(f * 10) / 10;
}

function TaskListAddRow(t, task, index)
{
	var r = t.insertRow(-1);
	r.name = "row_" + task.index;
	var c;

	var tor = GetTorrentByName(task.name);
	if(tor && tor.complete == 1 && task.status == READY)
	{
		if(GlobalSetting.ShowDone != null)
		{
			if(GlobalSetting.ShowDone == false)
				$(r).hide();
		}
		else if(tor.auto_hide == 1)
			$(r).hide();
	}

	if(task.status == SEEDING)
	{
		$(r).addClass("nodrop");
		$(r).addClass("nodrag");
		
		$(r).bind("mouseenter",function(){
			prev_color = $(this).css("background-color");
			$(this).css("background-color", "#FCFBDD");
			$(this).find(".delete_hint").show();
		}).bind("mouseleave",function(){
			//$(this).css("background-color", prev_color);
			$(this).css("background-color", "#FFF");
			$(this).find(".delete_hint").hide();
		});
	}
	else
	{
		$(r).bind("mouseenter",function(){
			prev_color = $(this).css("background-color");
			$(this).css("background-color", "#FCFBDD");
			$(this).find(".drag_hint").show();
			$(this).find(".delete_hint").show();
		}).bind("mouseleave",function(){
			//$(this).css("background-color", prev_color);
			$(this).css("background-color", "#FFF");
			$(this).find(".drag_hint").hide();
			$(this).find(".delete_hint").hide();
		});
	}
	
	/*
	if(task.status == SEEDING)
		$(r).css("background-color", "#E2ECF1");
	*/
	//if(task.status == DOWNLOADING)
	//	$(r).css("background-color", "#F5F9E1");

	/*
	if(index % 2 == 0)
		r.className = "tr2";
	*/


	/*
	if(index == sel_task_index)
	{
		r.className = "tr_sel";
		sel_row = r;
	}

	$(r).click(function(){
		if(sel_row)
		{
			if(sel_task_index % 2 == 0)
				sel_row.className = "tr2";
			else
				sel_row.className = "";
		}
		sel_task_index = index;
		sel_row = r;
		r.className = "tr_sel";
		GraphInit();
	});


	$(r).dblclick(function(){
		$('#t_setting_dlg').dialog('open');
	});
	*/
	c = r.insertCell(-1);
	c.style.width = "36px";
	c.innerHTML = "<div id='drag_hint"+index+"' class='drag_hint' style='display:none'></div>";

	c = r.insertCell(-1);
	c.style.width = "80px";
	if(task.status == DOWNLOADING)
	{
		c.innerHTML = "<div id='health_hint"+index+"' class='health_hint'></div>";
		c.innerHTML += "<div id='health_bar"+index+"' class='health_1'></div>";
	}

	c = r.insertCell(-1);
	c.style.width = "20px";
	c.innerHTML = "<input type='checkbox' class='checkbox' name='check_"+task.index+"' >";

	c = r.insertCell(-1);
	waiting_index = ConvertWaitingIndex(index);
	
	if(task.status == SEEDING)
		c.innerHTML = "<img src='../images/up_hint.png' class='status_hint'>";
	else if(task.status == DOWNLOADING)
		c.innerHTML = "<img src='../images/down_hint.png' class='status_hint'>";
	else if(task.status == WAITING)
		c.innerHTML = "<img src='../images/wait_hint.png' class='status_hint'>";
	else if(task.status == READY && GetTorrentByName(task.name).complete == 1)
		c.innerHTML = "<img src='../images/ok_hint.png' class='status_hint'>";
	if(task.status == WAITING || task.status == READY)
	{
		if(task.status == WAITING)
			c.innerHTML += "<span id='waiting_index'" + waiting_index + " class='task_index'>" + (waiting_index+1) + ". </span>";
		c.innerHTML += TrimTorrentName(task.name);
	}
	else
	{
		c.innerHTML += "<span class='task_link' id='task_link"+index+"' onclick='OpenDetailDialog("+task.index+");'>"+TrimTorrentName(task.name) + "</span>";
		$("#task_link"+index).hover(
			function()
			{
				$(this).attr("className", "task_link_hover");
			},
			function()
			{
				$(this).attr("className", "task_link");
			}
		);
	}
	if(task.status == WAITING || task.status == READY)
		c.colSpan = 4;
	if(task.status == DOWNLOADING || task.status == SEEDING)
	{
		c = r.insertCell(-1);
		c.style.width = "64px";
		c.innerHTML = "";
		
		c.innerHTML += "<div id='btn_stop"+index+"' class='btn_stop' title='Stop downloading / uploading the selected torrent'></div>";

		if(task.paused)
			c.innerHTML += "<div id='btn_toggle"+index+"' class='btn_start' title='Restart downloading / uploading the selected torrent'></div>";
		else
			c.innerHTML += "<div id='btn_toggle"+index+"' class='btn_pause' title='Pause downloading / uploading the selected torrent'></div>";

		$("#btn_stop"+index).hover(
			function () {
				$(this).attr("className", "btn_stop_over");
			}, 
			function () {
				$(this).attr("className", "btn_stop");
			}
		).click(function(){
			$.get("CLIENTQUIT", {index: task.index, sid: Math.random()});
			ShowProceeding();
			UILockCondition.Register({type: "torrent", name: task.name, attr: "status", value: TORRENT_NOT_RUNNING})
		}
		);
		
		$("#btn_toggle"+index).hover(
			function () {
				if(task.paused)
					$(this).attr("className", "btn_start_over");
				else
					$(this).attr("className", "btn_pause_over");
			}, 
			function () {
				if(task.paused)
					$(this).attr("className", "btn_start");
				else
					$(this).attr("className", "btn_pause");
			}
		).click(function(){
			$.get("CLIENTPAUSE", {index: task.index, sid: Math.random()});
			ShowProceeding();
			
			UILockCondition.Register({type: "client", name: GetClientByIdx(task.index).name, attr: "paused", value: !task.paused})
			
			if(task.paused)
			{
				$(this).attr("className", "btn_pause_over");
				$(this).attr("title", "Pause downloading / uploading the selected torrent");
			}
			else
			{
				$(this).attr("className", "btn_start_over");
				$(this).attr("title", "Restart downloading / uploading the selected torrent");
			}
			
			$(this).tooltip({
				track: true,
				delay: 0,
				showURL: false,
				showBody: " - ",
				fixPNG: true,
				extraClass: "pretty",
				top: -15,
				left: 5
			});

			task.paused = !task.paused;
		}
		);
	}

	if(task.status == DOWNLOADING)
	{
		c = r.insertCell(-1);
		c.style.width = "200px";
		if(task.status == DOWNLOADING)
			c.innerHTML = "<div id='pb"+index+"' class='progressbar'></div>";
		else
			c.innerHTML = "";
		
		c = r.insertCell(-1);
		$(c).attr("align", "center");
		c.innerHTML = "<div id='upload_hint"+index+"' class='upload_0p'></div>";
		c.style.width = "60px";
	}
	else if(task.status == SEEDING)
	{
		c = r.insertCell(-1);
		c.style.width = "200px";
		c.innerHTML = "&nbsp";
	}

	if(task.status == SEEDING)
	{
		c = r.insertCell(-1);
		$(c).attr("align", "center");
		c.innerHTML = "<div id='upload_hint"+index+"' class='upload_100p'></div>";
		c.style.width = "60px";
	}
	
	c = r.insertCell(-1);
	c.style.width = "32px";
	c.innerHTML = "<div id='delete_hint"+index+"' class='delete_hint' style='display:none'></div>";
	
	$("#delete_hint"+index).hover(
		function () {
			
		}, 
		function () {
			
		}
	).click(function(){
		del_sel_idx.length = 0;
		var torrent_idx;
		if(task.index < TORRENT_INDEX_START)
			torrent_idx = GetTorrentIdxByName(GetClientByIdx(task.index).name);
		else
			torrent_idx = task.index - TORRENT_INDEX_START;
		del_sel_idx[0] = torrent_idx;
		$("#delete_dlg").dialog("open");
	}
	);
}

function TaskListUpdateRow(t, task, index)
{
	var r = t.rows[index];
	var c;
	var ci = 0;
		
	c = r.cells[ci++];
	//c.innerHTML = "<div id='drag_hint"+index+"' class='drag_hint' style='display:none'></div>";

	c = r.cells[ci++];
	if(task.status == SEEDING)
	{
		//c.innerHTML = "<div id='health_hint"+index+"' class='health_hint' style='display:none'></div>";
		//c.innerHTML += "<div id='health_bar"+index+"' class='health_1' style='display:none'></div>";
	}
	else
	{
		var health_lv = 1;
		var h_range = GlobalSetting.HEALTH_RANGE;
		
		if(task.seeds_c > h_range[0] && task.seeds_c <= h_range[1])
			health_lv = 2;
		else if(task.seeds_c > h_range[1] && task.seeds_c <= h_range[2])
			health_lv = 3;
		else if(task.seeds_c > h_range[2])
			health_lv = 4;
		
		if(health_lv == 1)
		{
			//c.innerHTML = "<div id='health_hint"+index+"' class='health_hint' title='Unpopular torrent seems unlikely to complete.'></div>";
			//if(GetTorrentByName(task.name).cannot_finish == 1)
			//	$("#health_hint"+index).attr("title", "Unpopular torrent seems unlikely to complete." + " " + "Can't download or DHT limitation.");
			//else
				$("#health_hint"+index).attr("title", "Unpopular torrent seems unlikely to complete.");
		}
		else
			//c.innerHTML = "<div id='health_hint"+index+"' class='health_hint' style='display:none'></div>";
			$("#health_hint"+index).hide();
		
		//c.innerHTML += "<div id='health_bar"+index+"' class='health_"+health_lv+"' title='There are currently few sources of this file - "+task.seeds_c+" seeds,"+task.peers_c+" peers'></div>";
		var m;
		if(health_lv > 2)
			m = "Quite popular, should be no problem.";
		else
			m = "There are currently few sources of this file.";
		$("#health_bar"+index).attr("className", "health_"+health_lv).attr("title", m + " - "+task.seeds_c+" seeds,"+task.peers_c+" peers");
	}

	c = r.cells[ci++];
	//c.innerHTML = "<input type='checkbox' name='check"+index+"'>";

	c = r.cells[ci++];
	if(task.status == WAITING)
	{
		//$("#waiting_index"+index).html(ConvertWaitingIndex(index) + 1 + ". ");
		//c.innerHTML = "<span class='task_index'>" + (ConvertWaitingIndex(index)+1) + ". </span>";
		//c.innerHTML += task.name;
	}
	else
	{
		//c.innerHTML = task.name;	
	}
	if(task.status == WAITING || task.status == READY)
		c.colSpan = 4;
	//else if(task.status == SEEDING)
	//	c.colSpan = 3;

	c = r.cells[ci++];
	//if(task.status == SEEDING)
	//	c.colSpan = 2;
	if(task.status == DOWNLOADING || task.status == SEEDING)
	{
		if(task.paused)
			$("#btn_toggle"+index).attr("className", "btn_start").attr("title", "Restart downloading / uploading the selected torrent");
		else
			$("#btn_toggle"+index).attr("className", "btn_pause").attr("title", "Pause downloading / uploading the selected torrent");
	}


	if(task.status == DOWNLOADING)
	{
		c = r.cells[ci++];
		var done = task.done>100?100:task.done;
		$("#pb"+index).reportprogress(done);
		$("#pb"+index).attr("title", done + " % complete. - " + TransSizeUnit(task.d_size) + " / " + TransSizeUnit(task.size) + "<br>" + TransSizeUnit(task.d_speed) + "/s");
	}

	if(task.paused)
	{
		$("#btn_toggle"+index).attr("title", "Restart downloading / uploading the selected torrent");
	}
	else
	{
		$("#btn_toggle"+index).attr("title", "Pause downloading / uploading the selected torrent");
	}

	if(task.status == SEEDING || task.status == DOWNLOADING)
	{
		c = r.cells[ci++];
		var target_size = task.size * GlobalSetting.StopRatio;
		var u_percent = Math.floor(task.u_size / target_size * 100);
		if(u_percent > 100) u_percent = 100;
		if(!u_percent) u_percent = 0;
		var u = Math.floor(task.u_size / target_size * 10) * 10;
		if(u > 100) u = 100;
		if(!u) u = 0;
		$(c).attr("align", "center");
		if(task.paused)
		{
			$("#upload_hint"+index).attr("className", "upload_stop").attr("title", u_percent+" % complete. - " + TransSizeUnit(task.u_size) + ", " + TransSizeUnit(task.u_speed) + "/s");
		}
		else
		{
			$("#upload_hint"+index).attr("className", "upload_"+u+"p").attr("title", u_percent+" % complete. - " + TransSizeUnit(task.u_size) + ", " + TransSizeUnit(task.u_speed) + "/s");
		}
	}

	c = r.cells[ci++];
	//c.innerHTML = "<div id='delete_hint"+index+"' class='delete_hint' style='display:none'></div>";
};

function TaskListAddEmptyRow(t, index)
{
	var r = t.insertRow(-1);
	
	$(r).addClass("nodrag");
	$(r).addClass("nodrop");
	
	/*
	if(index % 2 == 0)
		$(r).addClass("tr2");
	*/
	
	//for(var j=0;j<7;j++)
	{
		var c = r.insertCell(-1);
		c.innerHTML = "&nbsp";
		c.colSpan = 8;
	}
}

function ConvertWaitingIndex(i)
{
	var r = i - seeding_list.length - downloading_list.length;
	if(r < 0) r = 0;
	else if(r > waiting_list.length-1) r = waiting_list.length-1;
	return r;
}


function RefreshTaskList(tb_id, action)
{
	var t = document.getElementById(tb_id);

	if(action == "CREATE")
	{
		//console.log("CREATE");

		for(var i=t.rows.length-1;i>=0;i--)
			t.deleteRow(i);

		for(var i=0;i<seeding_list.length;i++)
		{
			TaskListAddRow(t, seeding_list[i], i);
			TaskListUpdateRow(t, seeding_list[i], i);
		}

		for(var i=0;i<downloading_list.length;i++)
		{
			TaskListAddRow(t, downloading_list[i], i+seeding_list.length);
			TaskListUpdateRow(t, downloading_list[i], i+seeding_list.length);
		}

		for(var i=0;i<waiting_list.length;i++)
		{
			TaskListAddRow(t, waiting_list[i], i+seeding_list.length+downloading_list.length);
			TaskListUpdateRow(t, waiting_list[i], i+seeding_list.length+downloading_list.length);
		}

		for(var i=0;i<ready_list.length;i++)
		{
			TaskListAddRow(t, ready_list[i], i+seeding_list.length+downloading_list.length+waiting_list.length);
			TaskListUpdateRow(t, ready_list[i], i+seeding_list.length+downloading_list.length+waiting_list.length);
		}

		var row_no = $("#task_list_table tr:visible").length;
		for(var i=0;i<10-row_no;i++)
		{
			TaskListAddEmptyRow(t, i);
		}

		/*
		if(waiting_list.length == 0)
		{
			sel_task_index = -1;
			
		}
		*/

		$("#"+tb_id + " *").tooltip({
			track: true,
			delay: 0,
			showURL: false,
			showBody: " - ",
			fixPNG: true,
			extraClass: "pretty",
			top: -15,
			left: 5
		});
			
		$('#task_list_table :checkbox').click(function() {
			if(this.checked == false)
				$('#check_all').attr("checked", this.checked);
		});
		
		$("#task_list_table").tableDnD(
		{
			onDragClass: "task_dragging",
			onDrop: function(table, row) {
				var rows = table.tBodies[0].rows;
				var drop_index;
				var drag_waiting_idx;
				var drop_waiting_idx;
				var tmp_task;
				var from;
				var to;
				for (var i=0; i<rows.length; i++) {
					if(row == rows[i]) {
						drop_index = i;
						break;
					}
				}
				//console.log(drop_index);
				
				from = parseInt(row.name.split("_")[1]);
				//to = from + (drop_index - drag_index);
				
				if(from >= TORRENT_INDEX_START)
				{
					from -= TORRENT_INDEX_START;
					var client = GetClientByName(GetTorrentByIdx(from).name);
					//to -= TORRENT_INDEX_START;
					
					if(client.status == READY)
					{
						if(drop_index < seeding_list.length + downloading_list.length + waiting_list.length)
						{
							$(row).find(":checkbox").attr("checked", true);
							StartTask();
						}
					}
					else // Waiting
					{
						if(drag_index != drop_index)
						{
							from = GetTorrentByName(client.name).index;
							to = GetTorrentByName(waiting_list[ConvertWaitingIndex(drop_index)].name).index;
							
							$.get("MVTORRENT", {f_index: from, t_index: to, sid: Math.random()});
							RefreshNow(true);
						}
					}
				}
				else
				{
					if(drop_index >= seeding_list.length + downloading_list.length)
					{
						$(row).find(":checkbox").attr("checked", true);
							StopTask();
					}
				}
				RefreshNow(false);
			},
			onDragStart: function(table, row) {
				//console.log("ondragstart");
				clearInterval(int_id);
				var rows = table.rows;
				for (var i=0; i<rows.length; i++) {
					if(row == rows[i]) {
						drag_index = i;
						break;
					}
				}
			}
		});
	}
	else if(action == "UPDATE")
	{
		for(var i=0;i<seeding_list.length;i++)
		{
			TaskListUpdateRow(t, seeding_list[i], i);
		}

		for(var i=0;i<downloading_list.length;i++)
		{
			TaskListUpdateRow(t, downloading_list[i], i+seeding_list.length);
		}

		$("#"+tb_id + " *").tooltip({
			track: true,
			delay: 0,
			showURL: false,
			showBody: " - ",
			fixPNG: true,
			extraClass: "pretty",
			top: -15,
			left: 5
		});

		/*
		for(var i=0;i<waiting_list.length;i++)
		{
			TaskListUpdateRow(t, waiting_list[i], i+seeding_list.length+downloading_list.length);
		}

		for(var i=0;i<ready_list.length;i++)
		{
			TaskListUpdateRow(t, ready_list[i], i+seeding_list.length+downloading_list.length+waiting_list.length);
		}
		*/
	}
}

function RefreshFileList(tb_id, f_list)
{
	var t = document.getElementById(tb_id);

	for(var i=t.rows.length-1;i>0;i--)
		t.deleteRow(i);

	for(var i=0;i<f_list.length;i++)
	{
		var f = f_list[i];
		var r = t.insertRow(-1);
		var c = r.insertCell(-1);
		r.className = "file_tr";
		if(f.n_total == 0)
		{
			c.className = "folder";
			c.innerHTML = f.name;
		}
		else
		{
			c.className = "file";
			c.innerHTML = f.name;
			c = r.insertCell(-1);
			c.innerHTML = TransSizeUnit(f.size);
			c = r.insertCell(-1);
			c.innerHTML = TrimFloat(f.n_have / f.n_total * 100) + " %";
		}
	}
}

function RefreshFolderList(tb_id, f_list)
{
	var t = document.getElementById(tb_id);

	for(var i=t.rows.length-1;i>=0;i--)
		t.deleteRow(i);

	for(var i=0;i<f_list.length;i++)
	{
		var f = f_list[i];
		var r = t.insertRow(-1);
		r.className = "file_tr";
		
		var c = r.insertCell(-1);
		c.className = "folder";
		c.innerHTML = f.name;
		c.id="folder\t" + f.path;
		
		$(c).click(function(){
			var path = this.id.split("\t")[1]
			OpenFolderDialog(path, folder_type);
		}).hover(
			function () {
				$(this).css("background-color", "#FCFBDD");
			}, 
			function () {
				$(this).css("background-color", "#FFF");
			}
		);
	}
}
//==============================================================================
function AddTask()
{
	$('#add_task_dlg').dialog('open');
}
//==============================================================================
function DeleteTask()
{
	if(!btn_del_ebl) return;
	
	var is_no_sel = true;
	var idx = 0;
	
	del_sel_idx.length = 0;
	$('#task_list_table :checkbox').each(function(i){
		if(this.checked)
		{
			var task_idx = parseInt(this.name.split("_")[1]);
			if(task_idx >= TORRENT_INDEX_START)
			{
				var status;
				task_idx -= TORRENT_INDEX_START;
				del_sel_idx[idx++] = task_idx;
			}
			is_no_sel = false;
		}
	});
	
		$('#task_list_table :checkbox').each(function(i){
		if(this.checked)
		{
			var task_idx = parseInt(this.name.split("_")[1]);
			if(task_idx < TORRENT_INDEX_START)
			{
				var c = GetClientByIdx(task_idx);
				if(c)
				{
					if(c.status == DOWNLOADING || c.status == SEEDING)
					{
						del_sel_idx[idx++] = GetTorrentIdxByName(c.name);
					}
				}
			}
			is_no_sel = false;
		}
	});
	
	if(is_no_sel)
		ShowMessage("Please place a check mark next to the torrent(s) you wish to cancel.");
	else
	{
		$("#delete_dlg").dialog("open");
	}
}
//==============================================================================
function StartTask()
{
	if(!btn_start_ebl) return;
	
	var is_no_sel = true;
	$('#task_list_table :checkbox').each(function(i){
		if(this.checked)
		{
			var task_idx = parseInt(this.name.split("_")[1]);
			if(task_idx < TORRENT_INDEX_START)
			{
				var c = GetClientByIdx(task_idx);
				if(c)
				{
					if(c.status == DOWNLOADING || c.status == SEEDING)
					{
						if(c.paused == true)
						{
							//$("#btn_toggle"+i).click();
							$.get("CLIENTPAUSE", {index: c.index, sid: Math.random()});
							ShowProceeding();
							UILockCondition.Register({type: "client", name: c.name, attr: "paused", value: !c.paused})
						}
					}
				}
			}
			else
			{
				var status;
				task_idx -= TORRENT_INDEX_START;
				$.get("TORRENTSTART", {index: task_idx, sid: Math.random()});
				ShowProceeding();
				/*
				if(IsReachMaxDownload())
					status = TORRENT_WAITING;
				else
					status = TORRENT_RUNNING;
				*/
				UILockCondition.Register({type: "torrent", name: GetTorrentByIdx(task_idx).name, attr: "status", value: [TORRENT_WAITING, TORRENT_RUNNING]})
			}
			is_no_sel = false;
		}
	});
	
	if(is_no_sel)
		ShowMessage("Please place a check mark next to the torrent(s) you wish to start.");
}
//==============================================================================
function StartAllTask()
{
	/*
	for(var i=0;i<waiting_list.length;i++)
	{
		var task = waiting_list[i];
		if(task.done == 100)
			task.status = SEEDING;
		else
			task.status = DOWNLOADING;
	}
	*/
}
//==============================================================================
function PauseTask()
{
	if(!btn_pause_ebl) return;
	
	var is_no_sel = true;
	$('#task_list_table :checkbox').each(function(i){
		if(this.checked)
		{
			var task_idx = parseInt(this.name.split("_")[1]);
			if(task_idx < TORRENT_INDEX_START)
			{
				var c = GetClientByIdx(task_idx);
				if(c.status == DOWNLOADING  || c.status == SEEDING)
				{
					if(c.paused == false)
					{
						//$("#btn_toggle"+i).click();
						$.get("CLIENTPAUSE", {index: c.index, sid: Math.random()});
						ShowProceeding();
						UILockCondition.Register({type: "client", name: c.name, attr: "paused", value: !c.paused})
					}
				}
			}
			is_no_sel = false;
		}
	});
	
	if(is_no_sel)
		ShowMessage("Please place a check mark next to the torrent(s) you wish to pause.");
}
//==============================================================================
function PauseAllTask()
{
	$('#task_list_table :checkbox').each(function(i){
		if(!this.checked)
			this.checked = true;
	});
	
	PauseTask();
	
	$('#task_list_table :checkbox').each(function(i){
			this.checked = false;
	});
}
//==============================================================================
function StopTask()
{
	if(!btn_stop_ebl) return;
	
	var is_no_sel = true;
	$('#task_list_table :checkbox').each(function(i){
		if(this.checked)
		{
			var task_idx = parseInt(this.name.split("_")[1]);
			if(task_idx >= TORRENT_INDEX_START)
			{
				task_idx -= TORRENT_INDEX_START;
				$.get("TORRENTSTOP", {index: task_idx, sid: Math.random()});
				ShowProceeding();
				UILockCondition.Register({type: "torrent", name: GetTorrentByIdx(task_idx).name, attr: "status", value: TORRENT_NOT_RUNNING})
			}
			is_no_sel = false;
		}
	});
	
	$('#task_list_table :checkbox').each(function(i){
		if(this.checked)
		{
			var task_idx = parseInt(this.name.split("_")[1]);
			if(task_idx < TORRENT_INDEX_START)
			{
				var c = GetClientByIdx(task_idx);
				if(c)
				{
					if(c.status == DOWNLOADING || c.status == SEEDING)
					{
						$.get("CLIENTQUIT", {index: task_idx, sid: Math.random()});
						ShowProceeding();
						UILockCondition.Register({type: "torrent", name: c.name, attr: "status", value: TORRENT_NOT_RUNNING})
					}
				}
			}
			is_no_sel = false;
		}
	});
	
	if(is_no_sel)
		ShowMessage("Please place a check mark next to the torrent(s) you wish to stop.");
}
//==============================================================================
function StopAllTask()
{
	/*
	for(var i=0;i<waiting_list.length;i++)
	{
		var task = waiting_list[i];
		task.status = READY;
	}
	*/
}
//==============================================================================
function ShowHideDoneTask()
{
	if(GlobalSetting.ShowDone == null)
		GlobalSetting.ShowDone = true;
	else
		GlobalSetting.ShowDone = !GlobalSetting.ShowDone;
	
	RefreshNow(true);
}
//==============================================================================
function ShowMessage(msg)
{
	$('#message_dlg_msg').html(msg);
	$('#message_dlg').dialog('open');
}
//==============================================================================
function OpenDetailDialog(i)
{
	$('#t_setting_dlg_name').html(TrimTorrentName(client_dbs[i].name));
	$('#t_setting_dlg_size').html(TransSizeUnit(client_dbs[i].size));
	
	$.get("GETDETAILS", {index: i, sid: Math.random()}, function(data){
		//console.log(data);
		var t = ParseFileInfo(data);
		RefreshFileList("task_file_table", t);
		$('#t_setting_dlg').dialog('open');
	});
}
//==============================================================================
function OpenFolderDialog(path, type)
{
	folder_type = type;
	folder_name = path;
	
	$.get("GETDIR", {path: path, sid: Math.random()}, function(data){
		//console.log(data);
		var t = ParseFolderInfo(data);
		RefreshFolderList("task_folder_table", t);
		$('#folder_dlg_name').html(path.substring(GlobalSetting.DevicePath.length));
		$('#folder_dlg').dialog('open');
	});
}
//==============================================================================
function RefreshNow(redraw_table)
{
	if(redraw_table)
		hash_client = -1;
	
	clearInterval(int_id);
	GetClientsInfo();
	int_id = setInterval("GetClientsInfo()", GlobalSetting.RefreshInterval * 1000);	
}
//==============================================================================
function ShowProceeding()
{
	$('#proceeding_dlg').parent().find('.ui-dialog-titlebar-close').hide();
	$('#proceeding_dlg').parent().find('.ui-dialog-titlebar').hide();
	$('#proceeding_dlg').dialog('open');
	
	//RefreshNow(false);
}
//==============================================================================
function HideProceeding()
{
	$('#proceeding_dlg').dialog('close');
}

// for IE debug
/*
var console = new function()
{
	return{
		log: function(msg)
		{
			$("#debug_panel").html($("#debug_panel").html() + "<br>" + msg);
		}
	}
}
*/