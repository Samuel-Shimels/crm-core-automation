var CrmLib = CrmLib || {};

CrmLib.initCrmSheets = function(spreadsheetId) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var specs = [
    {name:'Meta', headers:['key','value']},
    {name:'Users', headers:['user_id','email','display_name','role','active','created_at','last_login']},
    {name:'Contacts', headers:['contact_id','owner_user_id','first_name','last_name','email','phone','company_id','source','status','lead_score','tags','created_at','updated_at']},
    {name:'Companies', headers:['company_id','name','industry','website','phone','address','owner_user_id','created_at','updated_at']},
    {name:'Deals', headers:['deal_id','title','company_id','primary_contact_id','owner_user_id','pipeline','stage','amount','currency','close_date','probability','status','created_at','updated_at']},
    {name:'Tasks', headers:['task_id','subject','description','related_type','related_id','owner_user_id','due_date','priority','status','reminder_sent','created_at','updated_at']},
    {name:'Email_Log', headers:['email_log_id','direction','from','to','subject','snippet','thread_id','related_id','message_id','timestamp']},
    {name:'Calendar_Events', headers:['event_id','title','start_time','end_time','attendees','related_id','created_by','gcal_event_id','created_at']},
    {name:'Activity_Audit', headers:['audit_id','entity_type','entity_id','action','user_id','timestamp','notes']},
    {name:'Lists', headers:['list_id','name','owner_user_id','filter_json','created_at']}
  ];
  specs.forEach(function(spec){
    var sh = ss.getSheetByName(spec.name);
    if (!sh) sh = ss.insertSheet(spec.name);
    sh.getRange(1,1,1,spec.headers.length).setValues([spec.headers]);
  });
  return { success: true };
}; 