	var beInitialized = 0;
	var timeString = '<% CurrentTime(); %>';
	//var NTP_connection = '<!--#echo var="NTP_connection" -->';
	var NTP_connection = '1';
	var clock_year;
	var clock_mon;
	var clock_day;
	var clock_hour;
	var clock_min;
	var clock_sec;
	
	function funClock() {
		var runTime = new Date();
		var hours = clock_hour;
		var minutes = clock_min;
		var seconds = clock_sec;
		var dn = "AM";

		if (!document.layers && !document.all && ! document.getElementById )
			return;
		if (hours >= 12) {
			dn = "PM";
			hours = hours - 12;
		}
		if (beInitialized != 0)
		{
			if (seconds == 0)
			{
				minutes++;
				clock_min++;
				if(minutes ==60)
				{
					hours++;
					clock_hour++;
					minutes = 0;
					clock_min = 0;
				}
			}
		}else beInitialized++;
		if (hours == 12 && minutes == 0 && seconds == 0)
		{
			document.location.href=document.location.href;
			return;
		}
		if (minutes <= 9) {
			minutes = "0" + minutes;
		}
		if (seconds <= 9) {
			seconds = "0" + seconds;
		}
		movingtime = hours + ":" + minutes + ":" + seconds + " " + dn;

		if (document.layers) {		// NetScape
			document.layers.clock.document.write(movingtime);
			document.layers.clock.document.close();
		}
		else if (document.all) {		// IE
			
			clock.innerHTML = movingtime;
		}
		else if (document.getElementById) {	// NetScape 6.0	
			document.getElementById('clock').innerHTML = movingtime;
		}		
		
		
		clock_sec++;
		if(clock_sec>59)
		{
			clock_sec = 0;
		}
		setTimeout("funClock()", 1000)
	}
	function initVariables() {
		if (parseInt(NTP_connection)) {
			if(timeString.substring(11,12) != '0')
				clock_hour = parseInt(timeString.substring(11,13));
			else
				clock_hour = parseInt(timeString.substring(12,13));
			clock_min = parseInt(timeString.substring(14,16));
			clock_sec = parseInt(timeString.substring(17,19));
			clock_year = parseInt(timeString.substring(6,10));
			if(timeString.substring(3,4) != '0')
				clock_mon = parseInt(timeString.substring(3,5));
			else
				clock_mon = parseInt(timeString.substring(4,5));
			if(timeString.substring(0,1) != '0')
				clock_day = parseInt(timeString.substring(0,2));
			else
				clock_day = parseInt(timeString.substring(1,2));
		} else {
			var curTime = new Date();
			clock_year = curTime.getFullYear();
			clock_mon = curTime.getMonth() + 1;
			clock_day = curTime.getDate();
			clock_hour = curTime.getHours();
			clock_min= curTime.getMinutes();
			clock_sec= curTime.getSeconds();
		}
	}
	window.onload = funClock;
