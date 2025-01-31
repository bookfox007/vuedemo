import $ from "jquery"
import bootbox from "bootbox"
import { getMessageCode } from "./msgutil"
import { getAccessorToken, setMessagingCallback, getDH } from "./messenger";
import { getDefaultRawParameters, getDefaultLanguage } from "./appinfo";

export function startWaiting() { 
	try{
		let dc = $(document.body);
		let sh = dc.innerHeight();
		let fslayer = $("#fswaitlayer");
		let lh = fslayer.height();
		let fstop = mouseY;
		if(lh > (sh-fstop)) fstop = mouseY-lh;
		fslayer.css("top",fstop);
		fslayer.css("left",mouseX>0?mouseX:dc.innerWidth()-50);
		fslayer.show();
	} catch(ex) { console.error(ex); }
}
export function stopWaiting() { 
	$("#fswaitlayer").hide();
}
export function submitFailure(xhr,status,errorThrown) { 
	stopWaiting();
	console.log("submitFailure",xhr.responseText);
	errorThrown = parseErrorThrown(xhr, status, errorThrown);
	alertbox(errorThrown, function() { 
		if(xhr.status==401) { 
			try {
				window.parent.reLogin();
			}catch(ex) { console.error(ex); }
		}
	});
}
export function parseErrorThrown(xhr,status,errorThrown) {
	if (!errorThrown) {
		errorThrown = xhr.responseText;
	} else {
		if(errorThrown==xhr.status) {
			errorThrown = xhr.responseText;
		}
	}
	try{
		if(xhr.status==400 || xhr.status==401) errorThrown = xhr.responseText; //400=Bad Request,401=Unauthen
		if(xhr.responseText) {
			let json = JSON.parse(xhr.responseText);
			if(json.text) errorThrown = json.text;
			if(json.head.errordesc) errorThrown = json.head.errordesc;
		}
	}catch(ex) { console.error(ex); }
	if(!errorThrown || errorThrown.trim().length==0) errorThrown = "Unknown error or network error";
	return errorThrown;
}
export function detectErrorResponse(data) {
	if(typeof data === "string") {
		try { data = JSON.parse(data); } catch(ex) { console.error(ex); }
	}
	if(data?.head?.errorflag=="Y") {
		alertmsg(data.head.errordesc);
		return true;
	}
	return false;
}
export function successbox(callback,params) {
	let title = getMessageCode("fsinfo",null,"Information");
	alertbox("QS0004",callback,null,params,null,title,"fa fa-info-circle");
}
export function warningbox(errcode,callback,params) {
	let title = getMessageCode("fswarn",null,"Warning");
	alertbox(errcode,callback,null,params,null,title,"fa fa-exclamation-circle");
}
export function alertbox(errcode, callback, defaultmsg, params, addonmsg, title, icon) {
	if(!title || title.trim().length==0) title = getMessageCode("fsalert",null,"Alert");
	let txt = getMessageCode(errcode, params);
	if(txt!=null && txt!="") {
		if(addonmsg) txt += " "+addonmsg;
		alertDialog(txt, callback, title, icon);
	} else {
		if (defaultmsg) {
			if(addonmsg) defaultmsg += " "+addonmsg;
			alertDialog(defaultmsg, callback, title, icon);
		} else {
			alertDialog(errcode, callback, title, icon);
		}
	}
}
export function alertDialog(msg, callbackfn, title="Alert", icon="fa fa-bell-o") {
	try {
		let fs_okbtn = getMessageCode("fsokbtn"); if(!fs_okbtn || (fs_okbtn=="" || fs_okbtn=="fsokbtn")) fs_okbtn = "OK";
		//let fs_okbtn = "OK";
		bootbox.alert({
			title: "<em class='"+icon+"'></em>&nbsp;<label>"+title+"</label>",
			message: msg,
			callback: function() {
				if (callbackfn) callbackfn();
			},
			buttons: {
				ok:  { label: fs_okbtn }
			}    		
		});
        $(".bootbox > .modal-dialog").draggable();
		return;
    } catch (ex) { console.error(ex); }
    if (callbackfn) callbackfn();
}
export function confirmbox(errcode, okFn, cancelFn, defaultmsg, params, addonmsg, title, icon) {
	if(!title || title.trim().length==0) title = getMessageCode("fsconfirm",null,"Confirmation");
	let txt = getMessageCode(errcode,params);
	if(txt!=null && txt!="") {
		if(addonmsg) txt += " "+addonmsg;
		return confirmDialog(txt, okFn, cancelFn, title, icon);
	} else {
		if (defaultmsg) {
			if(addonmsg) defaultmsg += " "+addonmsg;
			return confirmDialog(defaultmsg, okFn, cancelFn, title, icon);
		} else {
			return confirmDialog(errcode, okFn, cancelFn, title, icon);
		}
	}
}
export function confirmDialog(msg, okCallback, cancelCallback, title="Confirmation", icon="fa fa-question-circle") {
	try {
		let fs_confirmbtn = getMessageCode("fsconfirmbtn"); if(!fs_confirmbtn || (fs_confirmbtn=="" || fs_confirmbtn=="fsconfirmbtn")) fs_confirmbtn = "OK";
		let fs_cancelbtn = getMessageCode("fscancelbtn"); if(!fs_cancelbtn || (fs_cancelbtn=="" || fs_cancelbtn=="fscancelbtn")) fs_cancelbtn = "Cancel";
		//let fs_confirmbtn = "OK";
		//let fs_cancelbtn = "Cancel";
		bootbox.confirm({
			title: "<em class='"+icon+"'></em>&nbsp;<label>"+title+"</label>",
			message: msg, 
			callback: function(result) {
				if(result) {
					if (okCallback) okCallback();
				} else {
					if (cancelCallback) cancelCallback();
				}
			},
			swapButtonOrder: true,
			buttons: {
				confirm : { label: fs_confirmbtn },
				cancel: { label: fs_cancelbtn },
			}
		});
        $(".bootbox > .modal-dialog").draggable();
		return true;
    } catch (ex) { console.log(ex.description); }
	return true;
}
export function alertmsg(errcode, defaultmsg, params, callback) {
	alertbox(errcode, callback, defaultmsg, params);
}
export function confirmmsg(errcode, defaultmsg, params, okFn, cancelFn) {
	confirmbox(errcode, okFn, cancelFn, defaultmsg, params);
}
export function confirmDialogBox(errcode, params, defaultmsg, okFn, cancelFn, addonmsg) {
	return confirmbox(errcode, okFn, cancelFn, defaultmsg, params, addonmsg);
}
export function confirmDelete(params, okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0001",params,"Do you want to delete this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmSave(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0002",null,"Do you want to save this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmCancel(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0003",null,"Do you want to cancel this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmRemove(params, okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0005",params,"Do you want to delete this record?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmSend(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0006",null,"Do you want to send this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmUpdate(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0007",null,"Do you want to update this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmClear(params, okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0008",params,"Do you want to clear this?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmProcess(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0009",null,"Do you want to process this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmSaveAs(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0010",null,"Do you want to save as this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmReceive(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0011",null,"Do you want to receive this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmReset(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0012",null,"Do you want to reset this trasaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmErase(params, okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0013",params,"Do you want to delete %s row(s)?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmApprove(params, okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0014",params,"Do you want to confirm approve the %s request?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmReject(params, okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0015",params,"Do you want to reject %s?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmRequest(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0016",null,"Do you want to create this request?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmImport(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0017",null,"Do you want to import this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmExport(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0018",null,"Do you want to export this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmResend(okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0019",null,"Do you want to resend this transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}
export function confirmRevise(params, okFn, cancelFn, addonmsg) {
	if(!confirmDialogBox("QS0020",params,"Do you want to revise the transaction?",okFn,cancelFn,addonmsg)) return false;
	return true;
}

var mouseX = 0;
var mouseY = 0;
export function startApplication(pid,callback) {
	console.log("startApplication: pid="+pid);
	$(document).on("mousedown",function(e) { mouseX = e.pageX; mouseY = e.pageY; });
	//disable bootstrap modal auto close when click outside and ESC key
	try {
		//bootstrap v4
		$.fn.modal.Constructor.Default.backdrop = "static";
		$.fn.modal.Constructor.Default.keyboard = false;
	} catch(ex) { console.error(ex);  }
	setMessagingCallback(callback);
}
export function serializeParameters(parameters, addonParameters, raw) {
	if(addonParameters) {
		Object.assign(parameters,addonParameters);
	}
	let jsondata = { };
	let cipherdata = false;
	if(raw || getDefaultRawParameters()) {
		jsondata = parameters;
	} else {
		let dh = getDH();
		if(dh) {
			cipherdata = true;
			jsondata.ciphertext = dh.encrypt(JSON.stringify(parameters));
		} else {
			jsondata = parameters;
		}
	}
	console.log("serialize: parameters",parameters);
	console.log("serialize: jsondata",jsondata);
	let token = getAccessorToken();
	return { cipherdata: cipherdata, jsondata: jsondata, headers : { "authtoken" : token, "data-type": cipherdata?"json/cipher":"", language: getDefaultLanguage() } };
}
export function decryptCipherData(headers, data) {
	let accepttype = headers["accept-type"];
	let dh = getDH();
	if(accepttype=="json/cipher") {
		let json = JSON.parse(data);
		if(dh && json.body.data && typeof json.body.data === "string") {
			let jsondatatext = dh.decrypt(json.body.data);
			console.log("jsondatatext",jsondatatext);
			let jsondata = JSON.parse(jsondatatext);
			json.body = jsondata;
			return json;
		}
	}
	if(accepttype=="text/cipher") {
		let jsontext = dh.decrypt(data);
		console.log("jsontext",jsontext);
		if(jsontext) {
			let json = JSON.parse(jsontext);
			return json;
		}
	}
	return data;
}
