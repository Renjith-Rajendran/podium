var pushNotification;
var domainName;
var portalId;
var deviceId="testApple";

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    if (navigator.splashscreen) {
        console.warn('Hiding splash screen');
        // We're done initializing, remove the splash screen
        setTimeout(function() {
                   navigator.splashscreen.hide();
                   }, 100);
    }
    loadSchoolList();
}

function loadSchoolList() {
    $.ajax({
         url:"http://www.polussoftware.com/podium_mobile/school_list.js", // Location of the service
         contentType:"application/json; charset=utf-8", // content type sent to server
         dataType:"json", //Expected data format from server
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
    /*if(result.schoolListArray.length ==1){
        window.localStorage.setItem("DomainName",result.schoolListArray[0].schoolURL);
        window.localStorage.setItem("PortalId",result.schoolListArray[0].schoolPort);
        window.localStorage.setItem("schoolLogo",result.schoolListArray[0].schoolLogo);
    }
    else{*/
        $.each(result.schoolListArray, function(key,value){
               console.log(value.schoolName);
               if (value.schoolName.length < 22) {
               var newlist = '<li id="' + value.id + '" onClick="loginPage(\'' + value.schoolLogo + '\',\'' + value.schoolURL + '\',\'' + value.schoolPort + '\')"<a href="#"><img src="' + value.schoolLogo + '" alt="" class="circle responsive-img circular_schools"></a><p>' + value.schoolName + '</p></li>';
               } else {
               var newlist = '<li id="' + value.id + '" onClick="loginPage(\'' + value.schoolLogo + '\',\'' + value.schoolURL + '\',\'' + value.schoolPort + '\')"><a href="#"><img src="' + value.schoolLogo + '" alt="" class="circle responsive-img circular_schools"></a><p><marquee>' + value.schoolName + '</marquee></p></li>';
               }
               $('#schoolListGrid').append(newlist);
               });
    //}
    $('#loginPage').hide();
    $('.preloader_blue').hide();
    $('#schoolSelectionPage').show();
}

// When Service call fails School List
function schoolListFailed(result) {
    alert('Server Error : Service call for Authentication Failed !');
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
    domainName = schoolUrl;
    portalId = schoolPort;
    $('#schoolImage').attr("src", schoolImage);
    $('#schoolSelectionPage').hide();
    $('#loginPage').show();
}

$('#loginPage').on('click', '#loginButton', function(event){
    $('.preloader_blue').show();
    if ($('#username').val().trim().length > 0 && $('#password').val().length > 0) {
        var username = $('#username').val().trim();
        var password = $('#password').val();
        /*var UserData = "userName=" + username + "&password=" + password + "&deviceId=" + deviceId + "&deviceType=ios&portalId=" + portalId;*/
        var Url = domainName + "/desktopmodules/PodiumServices/PodiumWCFService.svc/login?userName=" + username + "&password=" + password + "&deviceId=" + deviceId + "&deviceType=android&portalId=" + portalId;
        console.log("check " + Url);
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
            authenticationSucceeded(result)
        },
            error:authenticationFailed // When Service call fails
        });
    }
    else {
        alert("Please enter username and password!");
    }
});

$('#loginPage').on('click', '#schoolLogo', function(event){
    $('#loginPage,#studentDetailsPage,#profilePage,#messagePage,#applyLeavePage,#attendancePage,#examPage,#timeLinePage').hide();
    $('#schoolSelectionPage').show();
});

$('#studentDetailsPage').on('click', '#studentSchoolLogo', function(event){
    $('#loginPage,#studentDetailsPage,#profilePage,#messagePage,#applyLeavePage,#attendancePage,#examPage,#timeLinePage').hide();
    $('#schoolSelectionPage').show();
});

// On Successfull service call Authentication
function authenticationSucceeded(result){
    console.log(result);
    $('.preloader_blue').hide();
    $('#loginPage,#schoolSelectionPage,#profilePage,#messagePage,#applyLeavePage,#attendancePage,#examPage,#timeLinePage').hide();
    $('#studentDetailsPage').show();
}

// When Service call fails Authentication
function authenticationFailed(result) {
    alert('Server Error : Service call for Authentication Failed !');
}

$('#studentDetailsPage').on('click', '#toDashBoard', function(event){
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#profilePage,#messagePage,#applyLeavePage,#attendancePage,#examPage,#timeLinePage').hide();
    $('#dashBoardPage').show();
});

function dashBoardPage()
{
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#profilePage,#messagePage,#applyLeavePage,#attendancePage,#examPage,#timeLinePage').hide();
    $('#dashBoardPage').show();
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
    var Url = "http://www.d-nuke.com/desktopmodules/PodiumServices/PodiumWCFService.svc/Notifications?parentId=1768&studentId=1767";
    console.log("check " + Url);
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
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#timeLinePage,#examPage,#attendancePage,#applyLeavePage').hide();
    $('#messagePage').show();
    var resultObject = eval ("(" + result + ")");
    console.log(resultObject);
    if (resultObject)
    {
        var resultNotification='';
        $.each(resultObject, function(i, row)
               {
               if(row.NotificationTypeName=="Attendance") {
               resultNotification+='<li class="messages-item avatar active"><i class="material-icons circle orange">done</i><div class="card-action row"><span class="col s9"><span class="reviews-no">'+row.NotificationSubject+'<br/> Due to fever </span></span><span class="col s3 price"><span class="text-align-right">'+row.NotificationTime+'<br/>'+row.NotificationDate+'</span></span></div></li>';
               }
               else if(row.NotificationTypeName=="Meeting"){
               resultNotification+='<li class="messages-item avatar"><i class="material-icons circle green">supervisor_account</i><div class="card-action row"><span class="col s9"><span class="reviews-no">'+row.NotificationSubject+'<br/>'+row.NotificationBody+'</span></span><span class="col s3 price"><span class="text-align-right">'+row.NotificationTime+'<br/>'+row.NotificationDate+'</span></span></div></li>'
               }
               else if(row.NotificationTypeName=="exam_publish"){
               resultNotification+='<li class="messages-item avatar"><i class="material-icons circle pink">description</i><div class="card-action row"><span class="col s9"><span class="reviews-no">'+row.NotificationSubject+'<br/>'+row.NotificationBody+'</span></span><span class="col s3 price"><span class="text-align-right">'+row.NotificationTime+'<br/>'+row.NotificationDate+'</span></span></div></li>'
               }
               });
        $('.messages').html(resultNotification);
        $('.messages').listview('refresh');
    }
}

// When Service call fails Authentication
function fetchMessagesFailed(result) {
    alert('Server Error : Service call for Messages Failed !');
}

function fetchProfile(){
    var Url="http://www.d-nuke.com/desktopmodules/PodiumServices/PodiumWCFService.svc/StudentProfile?studentId=1767";
    console.log("check " + Url);
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
    console.log(result);
    $('.preloader_blue').hide();
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#messagePage,#timeLinePage,#examPage,#attendancePage,#applyLeavePage').hide();
    $('#profilePage').show();
    var resultObject = eval ("(" + result + ")");
    if (resultObject.StudentId){
        //$('#resultStudentId').text(resultObject.StudentId);
        $('#resultName').text(resultObject.Name);
        $('#resultUserName').text(resultObject.UserName);
        $('#resultGrade').text(resultObject.Grade);
        $('#resultDivision').text(resultObject.Division);
        $('#resultAdmissionDate').text(resultObject.AdminssionDate);
        $('#resultAdmissionNo').text(resultObject.AdmissionNo);
        $('#resultDOB').text(resultObject.DOB);
        if(resultObject.ProfilePicture) {
            $('#resultProfilePicture').attr('src',"http://"+resultObject.ProfilePicture);
        }
        else{
            $('#resultProfilePicture').attr('src',"images/student_pic.png");
        }
    }
}

// When Service call fails Authentication
function fetchProfileFailed(result) {
    alert('Server Error : Service call for Profile Failed !');
}

function fetchApplyLeave(){
    var Url="";
    console.log("check " + Url);
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
           fetchApplyLeaveSucceeded(result)
           },
           error:fetchApplyLeaveFailed // When Service call fails
           });
}

// On Successfull service call Authentication
function fetchApplyLeaveSucceeded(result){
    console.log(result);
    $('.preloader_blue').hide();
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#messagePage,#timeLinePage,#attendancePage,#examPage').hide();
    $('#applyLeavePage').show();
}

// When Service call fails Authentication
function fetchApplyLeaveFailed(result) {
    alert('Server Error : Service call for Profile Failed !');
}

function fetchAttendance(){
    var Url="http://www.d-nuke.com/desktopmodules/PodiumServices/PodiumWCFService.svc/AttendanceDetails?studentId=1761&fromDate=2015/02/01&toDate=2015/03/26";
    console.log("check " + Url);
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
           fetchAttendanceSucceeded(result)
           },
           error:fetchAttendanceFailed // When Service call fails
           });
}

// On Successfull service call Authentication
function fetchAttendanceSucceeded(result){
    console.log(result);
    $('.preloader_blue').hide();
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#messagePage,#timeLinePage,#applyLeavePage,#examPage').hide();
    $('#attendancePage').show();
}

// When Service call fails Authentication
function fetchAttendanceFailed(result) {
    alert('Server Error : Service call for Profile Failed !');
}

function fetchExams(){
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#messagePage,#timeLinePage,#attendancePage,#applyLeavePage').hide();
    $('#examPage').show();
}

function fetchTimeLine(){
    $('#loginPage,#studentDetailsPage,#schoolSelectionPage,#dashBoardPage,#profilePage,#messagePage,#examPage,#applyLeavePage,#attendancePage').hide();
    $('#timeLinePage').show();
}