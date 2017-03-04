function WEBCOMPONENT(getHtmlIDFunction,componentName,showBusyCursorFunction, removeBusyCursorFunction,removeCurtainFunction,suicideFunction){
"use strict";
var _private= {
    getHtmlID: getHtmlIDFunction,
    showBusyCursor: showBusyCursorFunction,
    removeBusyCursor: removeBusyCursorFunction,
    removeCurtain: removeCurtainFunction,
    componentName:componentName,
    commitSuicide: suicideFunction,
    afterRemove: null,
    thisObject:this,
    /////////

    viewModel:kendo.observable({
        getLabelText:function(id){  // dummy function, but must be there and will excute when translation binding is not in place.
            return ECO.labelTexts.getLabelText(id);
        },

      welcomeMessageVisible: function(){
        if(ECO.appSettings.EcoUserInfo && (ECO.appSettings.EcoUserInfo.sub != undefined)){
            return true;
        }
        else return false;
      },

      loginLinkVisible: function(){
        return (ECO.appSettings.EcoUserInfo == null )
      },

      getUserName:function(){
        if(this.get('welcomeMessageVisible')()){
            var welcome='';
            if(ECO.appSettings.EcoUserInfo.nickname !=''){
              welcome=ECO.appSettings.EcoUserInfo.nickname
            } else if(ECO.appSettings.EcoUserInfo.name!=''){
              welcome=ECO.appSettings.EcoUserInfo.name
            } else {
              welcome=ECO.appSettings.EcoUserInfo.email
            }
            return welcome;
        } else return '';

      },

      registerUrl: function(){
        return 'https://idp.ecolearning.eu/register?lang='+ECO.language+'&cancelurl=' + ECO.appSettings.portalBaseUrl + '&loginurl=' + ECO.appSettings.portalBaseUrl +'?startup=login&initiator=EcoPortal';
      },


      getVersion: function(){
          return ECO.appSettings.version;
      },

      changeLanguageEnglish:function(){
        _private.changeLanguage('en');
      },
      changeLanguageFrench:function(){
        _private.changeLanguage('fr');
      },
      changeLanguageGerman:function(){
        _private.changeLanguage('de');
      },
      changeLanguagePortuguese:function(){
        _private.changeLanguage('pt');
      },
      changeLanguageSpanish:function(){
        _private.changeLanguage('es');
      },
      changeLanguageItalian:function(){
        _private.changeLanguage('it');
      },

      currentLanguageFlagUrl:'',
      currentLanguageFlagAltText:'',


      homeClick:function(e){
        componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/main/main.html', 'mainComponent',false,{});
      },


      allCoursesClick:function(e){
        $('ul.nav.navbar-nav li').removeClass('active');
        $(e.currentTarget.parentElement).addClass('active')
        componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/courses/allcourses.html', 'allCoursesComponent',false,{filter:'all'});
        //$("#" + _private.getHtmlID("eco-collapse-1")).collapse('hide');
      },

      comingSoonClick:function(e){
        $('ul.nav.navbar-nav li').removeClass('active');
        $(e.currentTarget.parentElement).addClass('active')
        componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/courses/allcourses.html', 'allCoursesComponent',false,{filter:'comingSoon'});
      },

      spotlightClick:function(e){
        $('ul.nav.navbar-nav li').removeClass('active');
        $(e.currentTarget.parentElement).addClass('active')
        componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/courses/allcourses.html', 'allCoursesComponent',false,{filter:'spotlight'});
      },

      myProfileClick:function(e){
        if(ECO.appSettings.EcoUserInfo){
            componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/profile/profile.html', 'profileComponent',false,{});
        }
      },

      teacherFormClick:function(e){
        $('ul.nav.navbar-nav li').removeClass('active');
        $(e.currentTarget.parentElement).addClass('active')
        componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/forms/teacherform.html', 'teacherFormComponent',false,{});
      },


      myDashboardClick:function(e){
        if(ECO.appSettings.EcoUserInfo){
            componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/dashboard/dashboard.html', 'dashboardComponent',false,{});
        }
      },

      loginClick: function(){
        ECO.autologin=false;
        ECO.sendAuthenticationRequest('openid profile email address eco');
      },

      logoutClick: function(){
        ECO.logoutIDP();
        ECO.appSettings.EcoUserInfo = null;
        // hide some buttons
        $('#btn-profile a').removeClass('enabled');
        $('#btn-mycourses a').removeClass('enabled');
        // phone...
        $('a#btn-phone-profile').removeClass('enabled');
        $('a#btn-phone-mycourses').removeClass('enabled');


        // enable login button on phone
        $('a#btn-phone-login').addClass('enabled');
        // disable logout button on phone
        $('a#btn-phone-logout').removeClass('enabled');

        _private.viewModel.trigger("change", { field: "welcomeMessageVisible"});
        _private.viewModel.trigger("change", { field: "loginLinkVisible"});
        $("#" + _private.getHtmlID("btnHome")).click();
      },

    }),       //// end viewmodel


    changeLanguage:function(language){
        ECO.loadLanguage(language);
    },

    updateLanguageDropDown: function(){
        // update language dropdown (visible on sm screen only)
        _private.viewModel.set("currentLanguageFlagUrl", "./img/" + ECO.language + ".png");
        if(ECO.language=='en'){
            _private.viewModel.set("currentLanguageFlagAltText", "English language");
        }
        if(ECO.language=='es'){
            _private.viewModel.set("currentLanguageFlagAltText", "Lengua española");
        }
        if(ECO.language=='fr'){
            _private.viewModel.set("currentLanguageFlagAltText", "Langue française");
        }
        if(ECO.language=='de'){
            _private.viewModel.set("currentLanguageFlagAltText", "Deutsche Sprache");
        }
        if(ECO.language=='it'){
            _private.viewModel.set("currentLanguageFlagAltText", "Lingua italiana");
        }
        if(ECO.language=='pt'){
            _private.viewModel.set("currentLanguageFlagAltText", "Em português");
        }

    },



    afterLogin: function(){
        _private.viewModel.trigger("change", { field: "welcomeMessageVisible"});
        _private.viewModel.trigger("change", { field: "loginLinkVisible"});

        // show some buttons
        $('#btn-profile a').addClass('enabled');
        $('#btn-mycourses a').addClass('enabled');
        // phone...
        $('a#btn-phone-profile').addClass('enabled');
        $('a#btn-phone-mycourses').addClass('enabled');


        // disable login button on phone
        $('a#btn-phone-login').removeClass('enabled');
        // enable logout button on phone
        $('a#btn-phone-logout').addClass('enabled');

        if(ECO.startupAction==='profile'){
            $("#" + _private.getHtmlID("btnMyProfile")).click();
            ECO.startupAction=null;
        } else if(!ECO.startupAction){
            // show popupadverts, when applicable after 3 sec
            // not any more...!
            // setTimeout(function(){ ECO.showPopupAdvertisement(); }, 3000);
            //$("#" + _private.getHtmlID("btnHome")).click();
        }
    },

    BindUIContols: function(){
      kendo.bind($("#" + _private.getHtmlID("screen")), _private.viewModel);
      kendo.bind($(".translate"),ECO.labelTexts);
      _private.updateLanguageDropDown();

    },

    DestroyUIContols: function(){
    },
};


this.init= function (userData){
    $(document).on("loadLanguageEvent.app", function () {
          _private.updateLanguageDropDown();
          _private.viewModel.trigger("change", { field: "registerUrl"});
    });

    $(document).on("showProfileEvent.app", function () {
        componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/profile/profile.html', 'profileComponent',false,{});
    });

    $(document).on("showCoursesEvent.app", function () {
        componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/courses/allcourses.html', 'allCoursesComponent',false,{});
    });


  //
  // add some extra functions to the global ECO object, that need a reference to this app object
  //
  ECO.afterLogin = function(){
      if(ECO.appSettings.EcoUserInfo && ECO.appSettings.EcoUserInfo.language){
          ECO.loadLanguage(ECO.appSettings.EcoUserInfo.language );
      }
     _private.afterLogin();
  };

  ECO.logoutIDP= function(){
        var settings={
            crossDomain: true,
            type:'POST',
            contentType:'application/json',
            dataType :"json",
            processData :false,  // we're sending json
            headers:{
                Authorization: 'Bearer ' + ECO.appSettings.accessToken
            }
        };

        $.ajax(ECO.appSettings.EcoOPAPIEndPoint+'/users/'+ECO.appSettings.EcoUserInfo.sub+'/logout', settings)
        .done(function( data, textStatus, jqXHR ) {
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
        })
  };


  ECO.showAdvertisement = function(advertisementId){
      if (!ECO.semaphores.popUpAdvertShowing){
          ECO.semaphores.popUpAdvertShowing = true;
      } else {
          return;
      }

      var html = false

      for(var i=0;i< ECO.appSettings.advertisements.adverts.length;i++){
          if(ECO.appSettings.advertisements.adverts[i].advertisementNr === advertisementId){
              html = ECO.labelTexts.getLabelText(ECO.appSettings.advertisements.adverts[i].translationId)
              break;
          }
      }

      if(html){
          //specific handling per advert
          if(advertisementId === 1 ){  // office365 advert
              bootbox.dialog({
                title: null,
                message: html,
                animate:true,
                onEscape: function(){
                    ECO.semaphores.popUpAdvertShowing = false;
                },
                buttons: {
                    Yes: {
                        label: ECO.labelTexts.getLabelText(262), //"I already got my free license
                        className: "btn-success btn-sm pull-left " + (ECO.appSettings.EcoUserInfo?"hide":""),
                        callback: function () {
                            ECO.semaphores.popUpAdvertShowing = false;
                        }
                    },
                    Later: {
                        label: ECO.labelTexts.getLabelText(263), //"Maybe later",
                        className: "btn-info btn-sm pull-left",
                        callback: function () {
                            ECO.semaphores.popUpAdvertShowing = false;
                        }
                    },

                    Now: {
                        label: ECO.labelTexts.getLabelText(264), //"I want it now!",
                        className: "btn-warning btn-lg pull-sm-right",
                        callback: function () {
                            ECO.semaphores.popUpAdvertShowing = false;
                            // check on being logged in
                            if(ECO.appSettings.EcoUserInfo && ECO.appSettings.EcoUserInfo.sub){
                                componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/forms/office365form.html', 'office65FormComponent',false,{});
                            } else {
                                bootbox.dialog({
                                  title: null,
                                  message: ECO.labelTexts.getLabelText(272),
                                  animate:true,
                                  onEscape: function(){
                                  },
                                  buttons: {
                                      Cancel: {
                                          label: ECO.labelTexts.getLabelText(263),
                                          className: "btn-info btn-sm pull-left",
                                          callback: function () {
                                          }
                                      },

                                      Ok: {
                                          label: ECO.labelTexts.getLabelText(273),
                                          className: "btn-warning btn-lg pull-right",
                                          callback: function () {
                                            $("#" + _private.getHtmlID("btnLogin")).click();
                                          }
                                      },
                                  }
                                });
                            }
                        }
                    },


                }
              });
          } // advertisementId === 1 (office365)
      }
  }





  _private.BindUIContols();

  if(ECO.startupAction==='profile'){
      // if profilepage must be shown at startup, force login
      $("#" + _private.getHtmlID("btnLogin")).click();
  } else if(ECO.startupAction==='login'){
      ECO.startupAction=null;
      $("#" + _private.getHtmlID("btnLogin")).click();
  } else if (ECO.startupAction==='noautologin') {
      ECO.startupAction=null;
      ECO.autologin = false;
  } else if(ECO.startupAction=="highlight" && ECO.highlightCourseOai){
      componentLoader.loadComponent(_private.getHtmlID('viewContainer'),'components/courses/highlight.html', 'highlightCourseComponent',false,{
        oaiIdentifier: ECO.highlightCourseOai
      });
      ECO.startupAction=null;
      ECO.highlightCourseOai=null;
  } else {
      // Normal startup:
      // find out if there's still a session with Eco IDP. If so => autologin
      ECO.autologin = true;  //flag for loginCallback indicating auto login attempt: No user interaction
      ECO.sendAuthenticationRequest('openid profile email address eco');

      if(ECO.startupAction=="eteacherinfo"){
            $("#" + _private.getHtmlID("btnTeacherForm")).click();
            ECO.startupAction=null;
      } else {
          $("#" + _private.getHtmlID("btnHome")).click();
      }
  }

};






this.remove= function(){
     try{
        $(document).off("loadLanguageEvent.app");
        $(document).off("showProfileEvent.app");
        $(document).off("showCoursesEvent.app");

        _private.DestroyUIContols();
        if (_private.afterRemove !== null){
            _private.afterRemove();
        }
     } catch(err){}
};





};



