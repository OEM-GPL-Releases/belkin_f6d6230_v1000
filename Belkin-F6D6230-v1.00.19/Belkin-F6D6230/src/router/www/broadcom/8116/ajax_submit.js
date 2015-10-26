function DoSubmit(param, action)
{
	var url = "apply.cgi";
	var ajax = new Ajax(url, {method: "post", data : param , onComplete: action}).request();
}

function CreateInput(name, value)
{
	value = encodeURIComponent(value);
	value = value.replace(/\~/g, "%7E");
	value = value.replace(/\!/g, "%21");
	value = value.replace(/\*/g, "%2A");
	value = value.replace(/\(/g, "%28");
	value = value.replace(/\)/g, "%29");
	value = value.replace(/\'/g, "%27");
	return name + "=" + value + "&";
}



function GetAllElements(f)
{
	var buf="";
	for(i=0; i<f.length; i++)
		if(f.elements[i].name.length>0)
			buf += CreateInput(f.elements[i].name, f.elements[i].value);
	return buf;
}