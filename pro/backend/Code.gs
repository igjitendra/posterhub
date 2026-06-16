/****************************************************************
 * PosterHub Pro — Google Apps Script backend
 * Google Sheet से जुड़ा Web App (login + subscription + WhatsApp)
 *
 * ⚠️ पहली बार / अपडेट के बाद:
 *   1) नीचे SALT और ADMIN_KEY बदलें।
 *   2) function dropdown से setup() एक बार Run करें।
 *   3) Deploy > Manage deployments > Edit > New version (ज़रूरी — वरना पुराना code चलता रहेगा)।
 *
 * ⚠️ WhatsApp column अब जुड़ा है। अगर आपने पहले से Users sheet बना रखी है
 *   (बिना WhatsApp के), तो उस Users sheet को delete करके दोबारा setup() चलाएं
 *   (अभी कोई real user नहीं है तो सबसे आसान यही है)।
 ****************************************************************/

var SALT      = 'CHANGE_THIS_SALT_9f3a7';      // ⚠️ कोई भी गुप्त random शब्द
var ADMIN_KEY = 'CHANGE_THIS_ADMIN_KEY_123';   // ⚠️ admin.html में यही डालें
var PLAN_DAYS = 30;

function setup(){ sheet_('Users'); sheet_('Payments'); }

function sheet_(name){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  if(!sh){
    sh = ss.insertSheet(name);
    if(name==='Users')    sh.appendRow(['Email','Hash','Name','WhatsApp','Token','Plan','Expiry','Status','Created']);
    if(name==='Payments') sh.appendRow(['Time','Email','Plan','Amount','TxnId','Status']);
  }
  return sh;
}

function hash_(pw){
  var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(pw)+SALT);
  return d.map(function(b){ return ('0'+(b & 255).toString(16)).slice(-2); }).join('');
}
function out_(o){ return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

// Users row (0-indexed): 0 Email,1 Hash,2 Name,3 WhatsApp,4 Token,5 Plan,6 Expiry,7 Status,8 Created
function findUser_(email){
  var sh = sheet_('Users'); var v = sh.getDataRange().getValues();
  for(var i=1;i<v.length;i++){ if(String(v[i][0]).toLowerCase() === email){ return {row:i+1, data:v[i]}; } }
  return null;
}

function doGet(e){ return ContentService.createTextOutput('PosterHub Pro API running'); }

function doPost(e){
  try{
    var req = JSON.parse(e.postData.contents); var a = req.action;
    if(a==='signup')         return signup_(req);
    if(a==='login')          return login_(req);
    if(a==='checkPlan')      return checkPlan_(req);
    if(a==='submitPayment')  return submitPayment_(req);
    if(a==='listPending')    return listPending_(req);
    if(a==='approvePayment') return approvePayment_(req);
    if(a==='rejectPayment')  return rejectPayment_(req);
    return out_({ok:false, error:'unknown action'});
  }catch(err){ return out_({ok:false, error:String(err)}); }
}

function signup_(req){
  var email = String(req.email||'').toLowerCase().trim();
  var wa = String(req.whatsapp||'').replace(/[^0-9]/g,'');
  if(!email || !req.password || !req.name) return out_({ok:false, error:'सभी field ज़रूरी हैं'});
  if(wa.length < 10) return out_({ok:false, error:'सही WhatsApp number डालें'});
  if(findUser_(email)) return out_({ok:false, error:'यह email पहले से registered है'});
  var token = Utilities.getUuid();
  sheet_('Users').appendRow([email, hash_(req.password), req.name, wa, token, '', '', 'none', new Date()]);
  return out_({ok:true, token:token, name:req.name, whatsapp:wa, plan:'', expiry:'', status:'none'});
}

function login_(req){
  var email = String(req.email||'').toLowerCase().trim();
  var u = findUser_(email);
  if(!u || u.data[1] !== hash_(req.password)) return out_({ok:false, error:'गलत email या password'});
  var token = Utilities.getUuid();
  sheet_('Users').getRange(u.row, 5).setValue(token);   // Token = col 5
  var d = u.data;
  return out_({ok:true, token:token, name:d[2], whatsapp:d[3], plan:d[5]||'', expiry:fmt_(d[6]), status:d[7]||'none'});
}

function checkPlan_(req){
  var u = findUser_(String(req.email||'').toLowerCase().trim());
  if(!u || u.data[4] !== req.token) return out_({ok:false, error:'session expired'});
  var d = u.data; var status = d[7]||'none';
  if(status==='active' && d[6]){ if(new Date(d[6]) < new Date()){ status='expired'; sheet_('Users').getRange(u.row,8).setValue('expired'); } }
  return out_({ok:true, name:d[2], whatsapp:d[3], plan:d[5]||'', expiry:fmt_(d[6]), status:status});
}

function submitPayment_(req){
  var u = findUser_(String(req.email||'').toLowerCase().trim());
  if(!u || u.data[4] !== req.token) return out_({ok:false, error:'session expired'});
  sheet_('Payments').appendRow([new Date(), u.data[0], req.plan, req.amount, req.txn, 'pending']);
  return out_({ok:true});
}

function listPending_(req){
  if(req.key !== ADMIN_KEY) return out_({ok:false, error:'unauthorized'});
  var sh = sheet_('Payments'); var v = sh.getDataRange().getValues(); var rows = [];
  for(var i=1;i<v.length;i++){ if(v[i][5]==='pending'){
    var u = findUser_(String(v[i][1]).toLowerCase()); var wa = u ? u.data[3] : '';
    rows.push({row:i+1, time:v[i][0], email:v[i][1], whatsapp:wa, plan:v[i][2], amount:v[i][3], txn:v[i][4]});
  } }
  return out_({ok:true, rows:rows});
}

function approvePayment_(req){
  if(req.key !== ADMIN_KEY) return out_({ok:false, error:'unauthorized'});
  var ps = sheet_('Payments'); var pv = ps.getDataRange().getValues(); var r = req.row;
  if(r < 2 || r > pv.length) return out_({ok:false, error:'invalid row'});
  var email = pv[r-1][1], plan = pv[r-1][2];
  ps.getRange(r, 6).setValue('approved');
  var u = findUser_(String(email).toLowerCase());
  if(!u) return out_({ok:false, error:'user नहीं मिला'});
  var exp = new Date(); exp.setDate(exp.getDate()+PLAN_DAYS);
  var us = sheet_('Users');
  us.getRange(u.row, 6).setValue(plan);    // Plan   = col 6
  us.getRange(u.row, 7).setValue(exp);     // Expiry = col 7
  us.getRange(u.row, 8).setValue('active');// Status = col 8
  return out_({ok:true});
}

function rejectPayment_(req){
  if(req.key !== ADMIN_KEY) return out_({ok:false, error:'unauthorized'});
  sheet_('Payments').getRange(req.row, 6).setValue('rejected');
  return out_({ok:true});
}

function fmt_(d){ if(!d) return ''; try{ return Utilities.formatDate(new Date(d), Session.getScriptTimeZone(), 'yyyy-MM-dd'); }catch(e){ return ''; } }
