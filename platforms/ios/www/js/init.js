var pushNotification;
var domainName;
var portalId;
var deviceId="iosdevice";
var interenetStatus = 0;
var academicMinDate,academicMaxDate,today = new Date();
var dateStartArray=[],dateEndArray=[];
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    if (device.platform == 'android' || device.platform == 'Android' || device.platform == 'amazon-fireos' ) {
        document.addEventListener("backbutton", onBackKeyDown, false);
    }
    
    pushNotification = window.plugins.pushNotification;
    
    if (navigator.splashscreen) {
        console.warn('Hiding splash screen');
        // We're done initializing, remove the splash screen
        setTimeout(function() {
                   navigator.splashscreen.hide();
                   }, 100);
    }
    $('.preloader_blue').show();
    loadSchoolList();
}

function onBackKeyDown(e) {
    e.preventDefault();
    navigator.notification.confirm("Are you sure you want to exit ?", onConfirm, "Confirmation", "Yes,No");
    // Prompt the user with the choice
}

function onConfirm(button) {
    if(button==2){//If User selected No, then we just do nothing
        return;
    }
    else{
        navigator.app.exitApp();// Otherwise we quit the app.
    }
}

function onPause() {
    alert("Pause");
}

function onResume() {
    alert("Resume");
}

// custom css expression for a case-insensitive contains()
jQuery.expr[':'].Contains = function(a,i,m){
    return (a.textContent || a.innerText || "").toUpperCase().indexOf(m[3].toUpperCase())>=0;
};


function pushNotificationRegister()
{
    try{
        //pushNotification = window.plugins.pushNotification;
        if (device.platform == 'android' || device.platform == 'Android' ||
            device.platform == 'amazon-fireos' ) {
            pushNotification.register(
                                      successHandler,
                                      errorHandler,
                                      {
                                      "senderID":"640202656272",
                                      "ecb":"onNotification"
                                      });
        }
        else {
            pushNotification.register(
                                      tokenHandler,
                                      errorHandler,
                                      {
                                      "badge":"true",
                                      "sound":"true",
                                      "alert":"true",
                                      "ecb":"onNotificationAPN"
                                      });
        }
    }
    catch(err){
        txt="There was an error on this page.\n\n";
        txt+="Error description: " + err.message + "\n\n";
        console.log(txt);
    }
}


function onNotificationAPN(e) {
    if (e.alert) {
        console.log(e.alert);
        // showing an alert also requires the org.apache.cordova.dialogs plugin
        //navigator.notification.alert(e.alert);
    }
    if (e.sound) {
        // playing a sound also requires the org.apache.cordova.media plugin
        var snd = new Media(e.sound);
        snd.play();
    }
    if (e.badge) {
        pushNotification.setApplicationIconBadgeNumber(successHandler, e.badge);
    }
}

// handle GCM notifications for Android
function onNotification(e) {
    console.log( e.event );
    
    switch( e.event )
    {
        case 'registered':
            if ( e.regid.length > 0 )
            {
                console.log( e.regid );
                // Your GCM push server needs to know the regID before it can push to this device
                // here is where you might want to send it the regID for later use.
                console.log("regID = " + e.regid);
                //window.localStorage["push_reg_id"] = e.regid;
                deviceId = e.regid;
            }
            break;
            
        case 'message':
            // if this flag is set, this notification happened while we were in the foreground.
            // you might want to play a sound to get the user's attention, throw up a dialog, etc.
            if (e.foreground)
            {
                // on Android soundname is outside the payload.
                // On Amazon FireOS all custom attributes are contained within payload
                var soundfile = e.soundname || e.payload.sound;
                // if the notification contains a soundname, play it.
                // playing a sound also requires the org.apache.cordova.media plugin
                var my_media = new Media("/android_asset/www/"+ soundfile);
                my_media.play();
            }
            else
            {
            }
            console.log( e.payload.message);
            //android only
            console.log( e.payload.msgcnt);
            break;
        case 'error':
            alert( e.msg );
            break;
        default:
            console.log('EVENT -> Unknown, an event was received and we do not know what it is');
            break;
    }
}

// Your iOS push server needs to know the token before it can push to this device
// here is where you might want to send it the token for later use.
function tokenHandler (result) {
    console.log("Token Handler"+result);
    deviceId=result;
}

function successHandler (result) {
    console.log(result);
}

function errorHandler (error) {
    console.log(error);
}

function checkConnetion()
{
    var networkState = navigator.connection.type;
    var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
    console.log(states[networkState]);
    if(states[networkState] == "Unknown connection" || states[networkState] == "No network connection")
    {
         interenetStatus = 0;
         //alert("Check your Internet connection!");
         popupMessage("Podium","Check your Internet connection!");
    }
    else
    {
        interenetStatus = 1;
    }
}

function loadSchoolList() {
    pushNotificationRegister();
    $.ajax({
         url:"http://www.polussoftware.com/podium_mobile/school_list.js",
         contentType:"application/json; charset=utf-8",
         dataType:"json",
         beforeSend: function() {
         $('.preloader_blue').show();
         },
         complete: function() {
         },
         success: function (result)
         {
         schoolListSucceeded(result)
         },
         error:schoolListFailed// When Service call fails
         });
}

// On Successfull service call School List
function schoolListSucceeded(result)
{
    $('#schoolListGrid').empty();
    $.each(result.schoolListArray, function(key,value){
        console.log(value.schoolName);
        if (value.schoolName.length < 22) {
        var newlist = '<li id="' + value.id + '" onClick="loginPage(\'' + value.schoolLogo + '\',\'' + value.schoolURL + '\',\'' + value.schoolPort + '\')"<a href="#"><img src="' + value.schoolLogo + '" alt="" class="circle responsive-img circular_schools"></a><p>' + value.schoolName + '</p></li>';
        } else {
        var newlist = '<li id="' + value.id + '" onClick="loginPage(\'' + value.schoolLogo + '\',\'' + value.schoolURL + '\',\'' + value.schoolPort + '\')"><a href="#"><img src="' + value.schoolLogo + '" alt="" class="circle responsive-img circular_schools"></a><p><marquee>' + value.schoolName + '</marquee></p></li>';
        }
        $('#schoolListGrid').append(newlist);
    });
   $('#loginPage,#studentDetailsPage,#profilePage,#messagePage,#applyLeavePage,#attendancePage,#examPage,#timeLinePage,#dashBoardPage').hide();
    $('.preloader_blue').hide();
    //window.localStorage.clear();
    $('#schoolSelectionPage').show();
}

// When Service call fails School List
function schoolListFailed(result) {
    //alert('Server Error : Service call for School List Failed !');
    popupMessage("Podium","Server Error : Service call for School List Failed !");
}

$('.search_box').change(function() {
    var filter = $(this).val();
    if (filter) {
    $('#schoolListGrid').find("p:not(:Contains(" + filter + "))").parent().slideUp();
    $('#schoolListGrid').find("p:Contains(" + filter + ")").parent().slideDown();
    }
    else {
    $('#schoolListGrid').find('li').slideDown();
    }
    return false;
})
.keyup(function() {
    // fire the above change event after every letter
    $(this).change();
});

function loginPage(schoolImage, schoolUrl, schoolPort) {
    console.log(schoolUrl+"==="+window.localStorage["LSDomainName"]);
    console.log(schoolPort+"==="+window.localStorage["LSPortalId"]);
    if ((window.localStorage["LSDomainName"] == schoolUrl)&&(window.localStorage["LSPortalId"] == schoolPort)) {
    }
    else
    {
        window.localStorage.setItem("LSIsRemeberMeChecked", "false");
        $('#rememberMe').prop('checked', false);
        window.localStorage.clear();
    }
    domainName = schoolUrl;
    portalId = schoolPort;
    window.localStorage.setItem("LSDomainName", schoolUrl);
    window.localStorage.setItem("LSPortalId", schoolPort);
    $('#schoolImage').attr("src", schoolImage);
    $('#schoolImageStudentList').attr("src", schoolImage);
    if (window.localStorage["LSIsRemeberMeChecked"] == "true") {
        login(window.localStorage["LSUserName"], window.localStorage["LSPassword"]);
    } else {
        $('#schoolSelectionPage').hide();
        $('#loginPage').show();
    }
}

$('#loginPage').on('click', '#loginButton', function(event){
    $('.preloader_blue').show();
    if (document.getElementById('rememberMe').checked) {
    window.localStorage.setItem("LSIsRemeberMeChecked", "true");
    } else {
    window.localStorage.setItem("LSIsRemeberMeChecked", "false");
    }
    if ($('#username').val().trim().length > 0 && $('#password').val().length > 0) {
        var username = $('#username').val().trim();
        var password = $('#password').val();
        window.localStorage.setItem("LSUserName", username);
        window.localStorage.setItem("LSPassword", password);
        login(username, password);
    }
    else {
        $('.preloader_blue').hide();
        //alert("Please enter username and password!");
        popupMessage("Podium","Username or password incorrect.");
        $('#username').val("");
        $('#password').val("");
                   
    }
});

function login(username, password) {
    var Url = domainName +"/desktopmodules/PodiumServices/PodiumWCFService.svc/login?userName=" + username + "&password=" + password + "&deviceId=" + deviceId + "&deviceType=ios&portalId=" + portalId;
    console.log("LoginUrl : "+Url);
    $.ajax({
           type: "GET", //GET or POST or PUT or DELETE verb
           url: Url, // Location of the service
           data: "", //Data sent to server
           dataType: "json", //Expected data format from server
           processdata: true, //True or False
           crossDomain: true,
           beforeSend: function() {
           $('.preloader_blue').show();
           // This callback function will trigger before data is sent
           },
           complete: function() {
           $('.preloader_blue').hide();
           },
           success: function(result) {
           serviceAuthenticationSucceeded(result)
           },
           error: serviceAuthenticationFailed // When Service call fails
           });
}

function serviceAuthenticationSucceeded(result) {
    $('.preloader_blue').hide();
    obj = JSON.parse(result);
    $('#select_student_list').empty();
    if (obj.Status == "1") {
        window.localStorage.setItem("LSParentId", obj.StudentDetails[0].ParentId);
        window.localStorage.setItem("LSAcademicStartDate", obj.AcadamicStartDate);
        window.localStorage.setItem("LSAcademicEndDate", obj.AcadamicEndDate);
        window.localStorage.setItem("LSGUID", obj.GUID);
        $('#username').val("");
        $('#password').val("");
        $('#schoolSelectionPage,#loginPage,#studentDetailsPage,#dashBoardPage,#messagePage,#timeLinePage').hide();
        $('#studentDetailsPage').show();
        var len = obj.StudentDetails.length;
        /*for (var i = 0; i < len; i++) {
            console.log("AuthenticationSucceeded --> Name : " + obj.StudentDetails[i].Name+"GradeName : " + obj.StudentDetails[i].GradeName+"DivisionName :  " + obj.StudentDetails[i].DivisionName+" ProfilePicture : " + obj.StudentDetails[i].ProfilePicture.length+"GUID :"+obj.GUID);
            if (obj.StudentDetails[i].ProfilePicture.length > 0) {
                console.log("http://"+obj.StudentDetails[i].ProfilePicture);
                console.log("http://"+obj.StudentDetails[i].ProfilePicture);
                var newList = '<li onclick="dashBoardPage(\''+ obj.StudentDetails[i].StudentId +'\',\''+  obj.StudentDetails[i].Name +'\',\''+  obj.StudentDetails[i].GradeId +'\',\''+  obj.StudentDetails[i].DivisionId +'\')"><div class="col s12 m8 offset-m2 l6 offset-l3"><div class="card-panel proceed_box"><div class="row valign-wrapper no-margin-bottom"><div class="col s4"><img src=" http://' + obj.StudentDetails[i].ProfilePicture + '" alt="" class="proceed_img"></div><div class="col s8"><p>Student Name:' + obj.StudentDetails[i].Name + ' <br /><br /> Standard :' + obj.StudentDetails[i].GradeName + obj.StudentDetails[i].DivisionName + '</p></div></div></div></div></li>';
            } else {
                var newList = '<li onclick="dashBoardPage(\''+ obj.StudentDetails[i].ParentId +'\',\''+ obj.StudentDetails[i].StudentId +'\',\''+  obj.StudentDetails[i].Name +'\',\''+  obj.StudentDetails[i].GradeId +'\',\''+  obj.StudentDetails[i].DivisionId +'\',\''+obj.AcadamicStartDate +'\',\''+ obj.AcadamicEndDate +'\',\''+ obj.GUID+'\')"><div class="col s12 m8 offset-m2 l6 offset-l3"><div class="card-panel proceed_box"><div class="row valign-wrapper no-margin-bottom"><div class="col s4"><img src="images/student_pic.jpg" alt="" class="proceed_img"></div><div class="col s8"><p>Student Name:' + obj.StudentDetails[i].Name + '<br /><br /> Standard :' + obj.StudentDetails[i].GradeName + obj.StudentDetails[i].DivisionName + '</p></div></div></div></div></li>';
            }
            $('#studentListingDetails').append(newList);
        }*/
        
        for (var i = 0; i < len; i++) {
            var capStudentName = obj.StudentDetails[i].Name;
            capStudentName = capStudentName.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                                                    return letter.toUpperCase();
                                                    });
            
            if (obj.StudentDetails[i].ProfilePicture.length > 0) {
                var newList = '<li class="select_student_proceed-item avatar" onclick="dashBoardPage(\''+ obj.StudentDetails[i].StudentId +'\',\''+  obj.StudentDetails[i].Name +'\',\''+  obj.StudentDetails[i].GradeId +'\',\''+  obj.StudentDetails[i].DivisionId +'\')"><div class="card-action row no-margin-bottom"><span class="col s4"><img src="http://'+obj.StudentDetails[i].ProfilePicture+'" alt="" class=" proceed_img"></span><span class="col s8 price"><p>Name : ' +capStudentName+ ' <br/>  Standard : ' + obj.StudentDetails[i].GradeName +' '+ obj.StudentDetails[i].DivisionName + ' </p></span></div></li>'
                
            }
            else
            {
                var newList = '<li class="select_student_proceed-item avatar" onclick="dashBoardPage(\''+ obj.StudentDetails[i].StudentId +'\',\''+  obj.StudentDetails[i].Name +'\',\''+  obj.StudentDetails[i].GradeId +'\',\''+  obj.StudentDetails[i].DivisionId +'\',\''+obj.AcadamicStartDate +'\',\''+ obj.AcadamicEndDate +'\',\''+ obj.GUID+'\')"><div class="card-action row no-margin-bottom"><span class="col s4"><img src="images/student_pic.jpg" alt="" class=" proceed_img"></span><span class="col s8 price"><p>Name :' + capStudentName+ ' <br/>  Standard : ' + obj.StudentDetails[i].GradeName +' '+ obj.StudentDetails[i].DivisionName + ' </p></span></div></li>'
            }
            $('#select_student_list').append(newList);
    }
    }
    else {
        $('.preloader_blue').hide();
        $('#username').val("");
        $('#password').val("");
        //alert("Please enter the valid username and password");
        popupMessage("Podium","Username or password incorrect.");
    }
}

function serviceAuthenticationFailed(e) {
    $('.preloader_blue').hide();
    $('#schoolSelectionPage').hide();
    $('#loginPage').show();
}

$('#loginPage').on('click', '#schoolImage', function(event){
                   loadSchoolList();
});

$('#studentDetailsPage').on('click', '#studentSchoolLogo', function(event){
                    loadSchoolList();
});

function dashBoardPage(StudentId,Name,GradeId,DivisionId)
{
     window.localStorage.setItem("LSStudentId",StudentId);
    var capName = Name;
    capName = capName.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                                            return letter.toUpperCase();
                                            });
     window.localStorage.setItem("LSStudentName",capName);
     window.localStorage.setItem("LSGradeId",GradeId);
     window.localStorage.setItem("LSDivisionId",DivisionId);
     dashBoardHome();
}

function dashBoardHome()
{
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#profilePage,#messagePage,#applyLeavePage,#attendancePage,#examPage,#timeLinePage').hide();
    $('#dashBoardPage').show();
    /*var headerText=window.localStorage["LSStudentName"];
    if (headerText.length < 10) {
        $('#headerStudentName:first').text(headerText);
    } else {
        $('#headerStudentName:first').text( '<marquee>' + headerText + '</marquee>');
    }*/
    
    var headerText=window.localStorage["LSStudentName"];
    if (headerText.length < 20) {
        $('#headerStudentName:first').html('<b>' + window.localStorage["LSStudentName"] + ' </b>');
    } else {
        $('#headerStudentName:first').html('<marquee><b>' + window.localStorage["LSStudentName"] + ' </b></marquee>');
    }

}

$('#dashBoardPage').on('click', '#profile', function(event){
    fetchProfile();
});

$('#dashBoardPage').on('click', '#attendance', function(event){
    fetchAttendance();
});

$('#dashBoardPage').on('click', '#message', function(event){
    fetchMessages();
});

$('#dashBoardPage').on('click', '#exam', function(event){
    fetchExams();
});

$('#dashBoardPage').on('click', '#apply_leave', function(event){
    fetchApplyLeave();
});

$('#dashBoardPage').on('click', '#timline', function(event){
    fetchTimeLine();
});

function fetchMessages(){
    var studentIdVal=window.localStorage["LSStudentId"];
    var parentIdVal=window.localStorage["LSParentId"];
    var Url = domainName +"/desktopmodules/PodiumServices/PodiumWCFService.svc/Notifications?parentId="+parentIdVal+"&studentId="+studentIdVal;
    console.log("Fetch Messages : " + Url);
    $.ajax({
           type: "GET", //GET or POST or PUT or DELETE verb
           url: Url, // Location of the service
           data: "", //Data sent to server
           contentType: "application/json; charset=utf-8", // content type sent to server
           dataType: "json", //Expected data format from server
           processdata: true, //True or False
           crossDomain: true,
           beforeSend: function() {
           $('.preloader_blue').show();
           },
           complete: function() {
           },
           success: function(result) {
           fetchMessagesSucceeded(result)
           },
           error:fetchMessagesFailed // When Service call fails
           });
}

// On Successfull service call Authentication
function fetchMessagesSucceeded(result){
    $('.preloader_blue').hide();
    var resultObject = eval ("(" + result + ")");
    console.log("Length "+resultObject.length);
    if (resultObject.length > 0)
    {
        $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#timeLinePage,#examPage,#attendancePage,#applyLeavePage').hide();
        $('#messagePage').show();
        /*var headerText=window.localStorage["LSStudentName"];
         $('#headerMsgStudentName:first').text(headerText);*/
        
        var headerText=window.localStorage["LSStudentName"]+" > Message";
        if (headerText.length < 20) {
            $('#headerMsgStudentName:first').html('<b>' + window.localStorage["LSStudentName"] + ' </b> > Message');
        } else {
            $('#headerMsgStudentName:first').html('<marquee><b>' + window.localStorage["LSStudentName"] + ' </b> > Message</marquee>');
        }
        
        var resultNotification='';
        $.each(resultObject, function(i, row)
               {
               if(row.NotificationTypeName=="Attendance") {
               resultNotification+='<li class="messages-item avatar"><i class="material-icons circle orange">assignment_ind</i><div class="card-action row"><span class="col s9"><span class="reviews-no">'+row.NotificationSubject+'<br/> Due to fever </span></span><span class="col s3 price"><span class="text-align-right">'+row.NotificationTime+'<br/>'+row.NotificationDate+'</span></span></div></li>';
               }
               else if(row.NotificationTypeName=="Meeting"){
               resultNotification+='<li class="messages-item avatar"><i class="material-icons circle green">supervisor_account</i><div class="card-action row"><span class="col s9"><span class="reviews-no">'+row.NotificationSubject+'<br/>'+row.NotificationBody+'</span></span><span class="col s3 price"><span class="text-align-right">'+row.NotificationTime+'<br/>'+row.NotificationDate+'</span></span></div></li>'
               }
               else if(row.NotificationTypeName=="exam_publish"){
               resultNotification+='<li class="messages-item avatar"><i class="material-icons circle pink">description</i><div class="card-action row"><span class="col s9"><span class="reviews-no">'+row.NotificationSubject+'<br/>'+row.NotificationBody+'</span></span><span class="col s3 price"><span class="text-align-right">'+row.NotificationTime+'<br/>'+row.NotificationDate+'</span></span></div></li>'
               }
               });
        $('#messagesList').html(resultNotification);
        $('#messagesList').listview('refresh');
    }
    else
    {
        popupMessage("Podium","No Messages to list");
    }
}

// When Service call fails Authentication
function fetchMessagesFailed(result) {
    //alert('Server Error : Service call for Messages Failed !');
    popupMessage("Podium","Server Error : Service call for Messages Failed !");
}

function fetchProfile(){
    var studentIdVal=window.localStorage["LSStudentId"];
    var Url=domainName +"/desktopmodules/PodiumServices/PodiumWCFService.svc/StudentProfile?studentId="+studentIdVal;
    console.log("Fetch Profile : " + Url);
    $.ajax({
           type: "GET", //GET or POST or PUT or DELETE verb
           url: Url, // Location of the service
           data: "", //Data sent to server
           contentType: "application/json; charset=utf-8", // content type sent to server
           dataType: "json", //Expected data format from server
           processdata: true, //True or False
           crossDomain: true,
           beforeSend: function() {
           $('.preloader_blue').show();
           },
           complete: function() {
           },
           success: function(result) {
           fetchProfileSucceeded(result)
           },
           error:fetchProfileFailed // When Service call fails
           });
}

// On Successfull service call Authentication
function fetchProfileSucceeded(result){
    $('.preloader_blue').hide();
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#messagePage,#timeLinePage,#examPage,#attendancePage,#applyLeavePage').hide();
    $('#profilePage').show();
    var resultObject = eval ("(" + result + ")");
    if (resultObject.StudentId){
        //$('#resultStudentId').text(resultObject.StudentId);
        var strName = resultObject.Name;
        strName = strName.toLowerCase().replace(/\b[a-z]/g, function(letter) {
                                        return letter.toUpperCase();
                                        });
        $('#resultName').text(strName);
        $('#resultUserName').text(resultObject.UserName);
       /* $('#resultGrade').text(resultObject.Grade);*/
        var divisionAndGrade= resultObject.Grade+ " "+resultObject.Division;
        $('#resultDivision').text(divisionAndGrade);
        $('#resultAdmissionDate').text(resultObject.AdminssionDate);
        $('#resultAdmissionNo').text(resultObject.AdmissionNo);
        $('#resultDOB').text(resultObject.DOB);
        if(resultObject.ProfilePicture) {
            $('#resultProfilePicture').attr('src',"http://"+resultObject.ProfilePicture);
        }
        else{
            $('#resultProfilePicture').attr('src',"images/student_pic.jpg");
        }
    }
}

// When Service call fails Authentication
function fetchProfileFailed(result) {
    //alert('Server Error : Service call for Profile Failed !');
    popupMessage("Podium","Server Error : Service call for Profile Failed !");
}

function fetchApplyLeave(){
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#messagePage,#timeLinePage,#attendancePage,#examPage').hide();
    $('#applyLeavePage').show();
   /* var headerText=window.localStorage["LSStudentName"];
    $('#headerApplyLeaveStudentName:first').text(headerText);*/
    var headerText=window.localStorage["LSStudentName"]+" > Apply Leave";
    if (headerText.length < 20) {
        $('#headerApplyLeaveStudentName:first').html('<b>' + window.localStorage["LSStudentName"] + ' </b> > Apply Leave');
    } else {
        $('#headerApplyLeaveStudentName:first').html('<marquee><b>' + window.localStorage["LSStudentName"] + ' </b> > Apply Leave</marquee>');
    }
    
    if(window.localStorage["LSAcademicStartDate"] != undefined){
        if(window.localStorage["LSAcademicStartDate"] != ""){
            academicMinDate=window.localStorage["LSAcademicStartDate"];
            dateStartArray = academicMinDate.split('/');
        }
    }
    if(window.localStorage["LSAcademicEndDate"] != undefined){
        if(window.localStorage["LSAcademicEndDate"] != ""){
            academicMaxDate=window.localStorage["LSAcademicEndDate"];
            dateEndArray = academicMaxDate.split('/');
        }
    }
   
    console.log("Start Date : "+new Date(dateStartArray[2],dateStartArray[0],dateStartArray[1]));
    console.log("End Date : "+new Date(dateEndArray[2],dateEndArray[0],dateEndArray[1]));
    
    $('#leave_date').pickadate({
                               max: new Date(dateEndArray[2],dateEndArray[0],dateEndArray[0]),
                               min: new Date(dateStartArray[2],dateStartArray[0],dateStartArray[0]),
                               format: 'dd/mm/yyyy',
                               formatSubmit: 'dd/mm/yyyy',
                               hiddenName: true,
                               today: '',
                               clear: 'Cancel',
                               close: 'OK'
                               });

}

$('#applyLeavePage').on('click', '#submitLeaveButton', function(event){
    applyLeave();
});

function applyLeave(){
    var absentType = 1;
    var leaveDate  = "";
    var message    = "";
    leaveDate =$('#leave_date').val();
    message =$('#textarea1').val();
    if (document.getElementById('forenoon').checked) {
        absentType = 1;
    }
    else if (document.getElementById('afternoon').checked){
        absentType = 2;
    }
    else if (document.getElementById('fullday').checked){
        absentType = 3;
    }
    else if (document.getElementById('hourPermission').checked){
        absentType = 4;
    }
    console.log(absentType,leaveDate);
    
    if(leaveDate !="" && message!="")
    {
        /*if(window.localStorage["DomainName"] != undefined){
            if( window.localStorage["DomainName"] != ""){
                domainName= window.localStorage["DomainName"];
            }
        }*/
        var Url=domainName +"/desktopmodules/PodiumServices/PodiumWCFService.svc/SendLeaveRequest?";
        var applyLeaveVal;
        if(window.localStorage["LSStudentId"] != undefined){
            if(window.localStorage["LSStudentId"] != ""){
                applyLeaveVal="leaveRequest="+"{\"ParentId\":" + window.localStorage["LSParentId"] +",\"StudentId\":" + window.localStorage["LSStudentId"] +",\"DivisionID\":"+ window.localStorage["LSDivisionId"] +",\"Date\":"+ leaveDate +",\"AbsentType\":"+ absentType +",\"Reason\":"+ "\""+message+"\"" +"}";
            }
        }
        var fullUrl =encodeURI(Url + applyLeaveVal);
         console.log("Fetch Apply Leave : " + fullUrl);
        $.ajax({
               type:"GET", //GET or POST or PUT or DELETE verb
               url:fullUrl, // Location of the service
               //  data:CheckAttendanceData, //Data sent to server
               contentType:"application/json; charset=utf-8", // content type sent to server
               dataType: "json", //Expected data format from server
               processdata:true, //True or False
               crossDomain:true,
               beforeSend: function() {
               $('.preloader_blue').show();
               },
               complete: function() {
               $('.preloader_blue').hide();
               },
               success: function (msg)
               {
               //On Successfull service call
               serviceLeavApplicationSucceeded(msg);
               },
               error: serviceLeavApplicationFailed
               // When Service call fails
               });
        
    }
    else{
        //alert('All fields should be filled !');
        popupMessage("Podium","All fields should be filled !");
    }
}

function serviceLeavApplicationSucceeded(result)
{
        var resultObject = eval ("(" + result + ")");
        if (resultObject)
        {
            $('#leave_date').val("");
            $('#textarea1').val("");
            if(resultObject.Results == true)
            {
                //alert('Leave Appliaction successfully sumbited');
                 popupMessage("Podium","Leave Appliaction submited successfully.");
            }
            else{
               /* if(resultObject.Reason == "Leave Already Exist")
                {*/
                   // alert('Leave already exist for the student in the date');
                  popupMessage("Podium","Leave already exist in the date.");
                }
                /*else
                    alert('Leave Appliaction not success. Try again..!');
                }*/
        }
}

// When Service call fails Leave Application
function serviceLeavApplicationFailed(result) {
    //alert('Server Error : Service call for Apply Leave Failed !');
    popupMessage("Podium","Server Error : Service call for Apply Leave Failed !");
}

function checkHoilday() {
    var dateChk =$('#leave_date').val();
    //Url = domainName+"/desktopmodules/PodiumServices/PodiumWCFService.svc/GetHolidayDetails?";
    var Url=domainName +"/desktopmodules/PodiumServices/PodiumWCFService.svc/GetHolidayDetails?";
    var dateCheck;
    if(window.localStorage["LSStudentId"] != undefined){
        if(window.localStorage["LSStudentId"] != ""){
            dateCheck="dates="+ dateChk + "&divisionId=" + window.localStorage["LSDivisionId"];
        }
    }
    var fullUrl =encodeURI(Url + dateCheck);
    
    $.ajax({
           type:"GET", //GET or POST or PUT or DELETE verb
           url:fullUrl, // Location of the service
           contentType:"application/json; charset=utf-8", // content type sent to server
           dataType:"json", //Expected data format from server
           processdata:true, //True or False
           crossDomain:true,
           beforeSend: function() {
           $('.preloader_blue').show();
           },
           complete: function() {
           $('.preloader_blue').hide();
           },
           success: function (msg)
           {
           //On Successfull service call
           serviceHolidaySucceeded(msg);
           },
           error: serviceAttendanceFailed
           // When Service call fails
           });
}

function serviceHolidaySucceeded(result)
{
    if( result == true) // holiday
    {
        $('#submitLeaveButton').attr('disabled', 'true');
       // alert('The selected date is Holiday, Try other date...');
        popupMessage("Podium","The selected date is Holiday, Try other date...");
    }
    else{                // not holiday
        $('#submitLeaveButton').removeAttr('disabled');
    }
}

/*------------------------- Retrieve Attendance Details from Server  ----------------------------------------*/
function fetchAttendance() {
    if(window.localStorage["LSAcademicStartDate"] != undefined){
        if(window.localStorage["LSAcademicStartDate"] != ""){
            academicMinDate=window.localStorage["LSAcademicStartDate"];
            dateStartArray = academicMinDate.split('/');
        }
    }
    if(window.localStorage["LSAcademicEndDate"] != undefined){
        if(window.localStorage["LSAcademicEndDate"] != ""){
            academicMaxDate=window.localStorage["LSAcademicEndDate"];
            dateEndArray = academicMaxDate.split('/');
        }
    }
    
    console.log("Start Date : "+new Date(dateStartArray[2],dateStartArray[0],dateStartArray[1]));
    
    $('#from_date').pickadate({
                              max: new Date(),
                              min: new Date(dateStartArray[2],dateStartArray[0],dateStartArray[0]),
                              format: 'dd/mm/yyyy',
                              formatSubmit: 'dd/mm/yyyy',
                              hiddenName: true,
                              today: '',
                              clear: 'Cancel',
                              close: 'OK'
                              });
    
    $('#to_date').pickadate({
                            max: new Date(),
                            min: new Date(dateStartArray[2],dateStartArray[0],dateStartArray[0]),
                            format: 'dd/mm/yyyy',
                            formatSubmit: 'dd/mm/yyyy',
                            hiddenName: true,
                            today: '',
                            clear: 'Cancel',
                            close: 'OK'
                            });

   /* $('#from_date').on('change', function(e, date)
        {
                       var dateVal=$('#from_date').val();
                       alert("Hello"+dateVal+" date"+ new Date(dateVal));
                       $('#to_date').pickadate({
                                               max: new Date(),
                                               min: new Date(dateVal),
                                               format: 'dd/mm/yyyy',
                                               formatSubmit: 'dd/mm/yyyy',
                                               hiddenName: true,
                                               today: '',
                                               clear: 'Cancel',
                                               close: 'OK'
                                               });
        });*/
    
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!
    var yyyy = today.getFullYear();
    var frmMonth = today.getMonth();
    var frmYYYY= yyyy;
    var frmDay = '01';
    if(dd<10){
        dd='0'+dd
    }
    if(mm<10)
    {
        mm='0'+mm
    }
    if(frmMonth<10)
    {
        frmMonth='0'+frmMonth
    }
    if(mm == 1 )
    {
        frmYYYY  = yyyy - 1;
        frmMonth = 12;
    }
    today = yyyy+'/'+mm+'/'+dd;
    from = frmYYYY+'/'+frmMonth+'/'+frmDay;
    var to_dateText= dd+'/'+mm+'/'+yyyy;
    var from_dateText= frmDay+'/'+frmMonth+'/'+frmYYYY;
    
    //console.log("to_dateText : "+new Date());
    //console.log("from_dateText: "+new Date(from_dateText));
    
    $('#from_date').val(from_dateText);
    $('#to_date').val(to_dateText);
    
    /*if(window.localStorage["DomainName"] != undefined){
        if( window.localStorage["DomainName"] != ""){
            domainName= window.localStorage["DomainName"];
        }
    }*/
    var Url=domainName +"/desktopmodules/PodiumServices/PodiumWCFService.svc/AttendanceDetails";
    var AttendanceData;
    if(window.localStorage["LSStudentId"] != undefined)
    {
        if(window.localStorage["LSStudentId"] != ""){
            AttendanceData="studentId="+window.localStorage["LSStudentId"]+"&fromDate="+ from + "&toDate="+ today;
        }
    }
    console.log("Fetch Attendance : " + Url+"?"+AttendanceData);
    $.ajax({
           type:"GET", //GET or POST or PUT or DELETE verb
           url:Url, // Location of the service
           data:AttendanceData, //Data sent to server
           contentType:"application/json; charset=utf-8", // content type sent to server
           dataType:"json", //Expected data format from server
           processdata:true, //True or False
           crossDomain:true,
           beforeSend: function() {
           $('.preloader_blue').show();
           },
           complete: function() {
           $('.preloader_blue').hide();
           },
           success: function (msg)
           {
           //On Successfull service call
           serviceAttendanceSucceeded(msg);
           },
           error: serviceAttendanceFailed
           // When Service call fails
           });
}

function checkAttendance()
{
    var fromDate =$('#from_date').val();
    var toDate = $('#to_date').val();
   
    var dateStartArray = fromDate.split('/');
    var startDate = dateStartArray[2] + '/' + dateStartArray[1] + '/' + dateStartArray[0];
    
    var dateEndArray = toDate.split('/');
    var endDate = dateEndArray[2] + '/' + dateEndArray[1] + '/' + dateEndArray[0];
    
    var dateStart = new Date(dateStartArray[2], dateStartArray[1], dateStartArray[0]); //Year, Month, Date
    var dateEnd = new Date( dateEndArray[2], dateEndArray[1], dateEndArray[0]);
        /*if(window.localStorage["DomainName"] != undefined){
            if( window.localStorage["DomainName"] != ""){
                domainName= window.localStorage["DomainName"];
            }
        }*/
    if (dateEnd > dateStart)
    {

        var Url=domainName +"/desktopmodules/PodiumServices/PodiumWCFService.svc/AttendanceDetails";
        var CheckAttendanceData;
        if(window.localStorage["LSStudentId"] != undefined)
        {
            if(window.localStorage["LSStudentId"] != ""){
                CheckAttendanceData="studentId="+window.localStorage["LSStudentId"]+"&fromDate="+ startDate + "&toDate="+ endDate;
            }
        }
        console.log("Check Attendance : " + Url+"?"+CheckAttendanceData);
        
        $.ajax({
               type:"GET", //GET or POST or PUT or DELETE verb
               url:Url, // Location of the service
               data:CheckAttendanceData, //Data sent to server
               contentType:"application/json; charset=utf-8", // content type sent to server
               dataType:"json", //Expected data format from server
               processdata:true, //True or False
               crossDomain:true,
               beforeSend: function() {
               $('.preloader_blue').show();
               },
               complete: function() {
               $('.preloader_blue').hide();
               },
               success: function (msg)
               {
               //On Successfull service call
               serviceAttendanceSucceeded(msg);
               },
               error: serviceAttendanceFailed
               // When Service call fails
               });
    }
    else
    {
        //alert("Please select valid dates");
        popupMessage("Podium","Please select valid dates");
    }
}
    
function serviceAttendanceSucceeded(result)
{
    $('.preloader_blue').hide();
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#messagePage,#timeLinePage,#applyLeavePage,#examPage').hide();
    $('#attendancePage').show();
    /*var headerText=window.localStorage["LSStudentName"];
    $('#headerAttendanceStudentName:first').text(headerText);
    */
    var headerText=window.localStorage["LSStudentName"]+" > Attendance";
    if (headerText.length < 20) {
        $('#headerAttendanceStudentName:first').html('<b>' + window.localStorage["LSStudentName"] + ' </b> > Attendance');
    } else {
        $('#headerAttendanceStudentName:first').html('<marquee><b>' + window.localStorage["LSStudentName"] + ' </b> > Attendance</marquee>');
    }

        var resultObject = eval ("(" + result + ")");
        if (resultObject)
        {
            $('#resultPercentage').text(resultObject.Percentage);
            $('#resultWorkingDays').text(resultObject.WorkingDays);
            $('#resultAbsentDays').text(resultObject.AbsentDays);
            $('#resultAbsentCount').text(resultObject.AbsenceDetails.length);
            
            var resultAbsentDetails='';
           
            if(resultObject.AbsenceDetails.length ==0)
            {
                $('#absenceListContainer').hide();
            }
            else
            {
                $('#absenceListContainer').show();
                $('#absenceList').empty();
                $.each(resultObject.AbsenceDetails, function(i, row)
                       {
                       resultAbsentDetails+='<li class="messages-item avatar"><i class="material-icons circle orange">assignment_ind</i><div class="card-action row"><span class="col s9"><span class="reviews-no">'+row.Reason+'<br/>'+row.AbsentType+'</span></span><span class="col s3 price"><span class="text-align-right">'+row.Date+'</span></span></div></li>';
                       });
                $('#absenceList').html(resultAbsentDetails);
                $('#absenceList').listview('refresh');
            }
        }
}

function serviceAttendanceFailed(result) {
    console.log('Service call failed: ' + result.status + '' + result.UserName);
    //alert('Check your connection and try again.');
    popupMessage("Podium","Server Error:Service call for attendance failed");
}

function fetchExams(){
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#messagePage,#timeLinePage,#attendancePage,#applyLeavePage').hide();
    $('#examPage').show();
    var headerText=window.localStorage["LSStudentName"]+" > Exam";
    if (headerText.length < 20) {
        $('#headerExamStudentName:first').html('<b>' + window.localStorage["LSStudentName"] + ' </b> > Exam');
    } else {
        $('#headerExamStudentNaƒme:first').html('<marquee><b>' + window.localStorage["LSStudentName"] + ' </b> > Exam</marquee>');
    }
}

function fetchTimeLine(){
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#messagePage,#examPage,#applyLeavePage,#attendancePage').hide();
    $('#timeLinePage').show();
    var headerText=window.localStorage["LSStudentName"]+" > School Events";
    if (headerText.length < 20) {
        $('#headerTimeLineStudentName:first').html('<b>' + window.localStorage["LSStudentName"] + ' </b> > School Events');
    } else {
        $('#headerTimeLineStudentName:first').html('<marquee><b>' + window.localStorage["LSStudentName"] + ' </b> > School Events</marquee>');
    }
}

function changeStudent()
{
    $('#loginPage,#schoolSelectionPage,#timeLinePage,#dashBoardPage,#profilePage,#messagePage,#examPage,#applyLeavePage,#attendancePage').hide();
    $('#studentDetailsPage').show();
}

function changeSchool()
{
     loadSchoolList();
}
function logOut()
{
    var LogOutData;
    if(window.localStorage["LSDomainName"] != undefined){
        if( window.localStorage["LSDomainName"] != ""){
            domainName= window.localStorage["LSDomainName"];
        }
    }
    if(window.localStorage["LSGUID"] != undefined){
        if(window.localStorage["LSGUID"] != ""){
            LogOutData = "guid="+window.localStorage["LSGUID"];
        }
    }
    var Url=domainName+"/desktopmodules/PodiumServices/PodiumWCFService.svc/logout";
    $.ajax({
        type:"GET", //GET or POST or PUT or DELETE verb
        url:Url, // Location of the service
        data:LogOutData, //Data sent to server
        contentType:"application/json; charset=utf-8", // content type sent to server
        dataType:"json", //Expected data format from server
        processdata:true, //True or False
        crossDomain:true,
        beforeSend: function() {
        $('.preloader_blue').show();
        },
        complete: function() {
        $('.preloader_blue').hide();
        },
        success: function (msg)
        {
        serviceLogOutSucceeded(msg);//On Successfull service call
        },
        error: serviceLogOutFailed// When Service call fails
    });
}


function serviceLogOutSucceeded(result)
{
    $('#studentDetailsPage,#schoolSelectionPage,#timeLinePage,#dashBoardPage,#profilePage,#messagePage,#examPage,#applyLeavePage,#attendancePage').hide();
    $('#loginPage').show();
    $('#username').val("");
    $('#password').val("");
    $('#rememberMe').prop('checked', false);
    window.localStorage.removeItem("LSGUID");
    window.localStorage.removeItem("LSIsRemeberMeChecked");
    window.localStorage.removeItem("LSUserName");
    window.localStorage.removeItem("LSPassword");
    // window.localStorage.clear();
    //$('#remember_me').attr('checked', false).checkboxradio('refresh');
}

function serviceLogOutFailed(result) {
    console.log('Service call failedfor LogOut');
}

function popupMessage(header,message){
     $('#popupBox').show();
     $('#popupTitle').text(header);
     $('#popupMessage').text(message);
}
function closePopupMessage(){
     $('#popupBox').hide();
}