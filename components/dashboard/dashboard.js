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
    viewModel :kendo.observable({
        getLabelText:function(id){
            return ECO.labelTexts.getLabelText(id);
        },

        gravatarVisible:false,
        gravatarUrl:'',
        profilename:'',
        showLoadingGif:false,

        myCourses:[], // this will be converted to an Observable array

        gotoCourseClick: function(e){
          // TODO:send xAPi statement when navigating to course
        },
    }),



    getGravatar: function(){
        var settings={
            crossDomain: true,
            type:'GET',
        };

        $.ajax(_private.viewModel.get('gravatarUrl'))
        .done(function( data, textStatus, jqXHR ) {
            _private.viewModel.set("gravatarVisible",true);
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
            _private.viewModel.set("gravatarVisible",false);
        })

    },

    loadUserInfo:function(){
      var settings={
          crossDomain: true,
          type:'GET',
          headers:{
              Authorization: 'Bearer ' + ECO.appSettings.accessToken
          }
      };

      $.ajax(ECO.appSettings.EcoOPUserInfoEndPoint, settings)
      .done(function( data, textStatus, jqXHR ) {
          if(ECO.appSettings.EcoUserInfo.sub !== data.sub){
              ECO.logoutIDP();
              window.location=ECO.appSettings.portalBaseUrl;
          } else {
            ECO.appSettings.EcoUserInfo = data;

            if(ECO.appSettings.EcoUserInfo.nickname && ECO.appSettings.EcoUserInfo.nickname !== ""){
                _private.viewModel.set('profilename',ECO.appSettings.EcoUserInfo.email + " (" + ECO.appSettings.EcoUserInfo.nickname +")") ;
            } else {
                _private.viewModel.set('profilename',ECO.appSettings.EcoUserInfo.email)
            }
            _private.viewModel.set('gravatarUrl',"https://www.gravatar.com/avatar/" + md5(ECO.appSettings.EcoUserInfo.email.trim()) + "?s=80&d=404" );
            _private.viewModel.set("gravatarVisible",false);
            _private.getGravatar();
          }
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
          displayError(_private.viewModel.getLabelText(49));
      });
    },


    courseList: null,

    getCourseProgress: function(){
        var settings={
            crossDomain: true,
            type:'GET',
            headers:{
                Authorization: 'Bearer ' + ECO.appSettings.accessToken
            }
        };

      $.ajax(ECO.appSettings.EcoBackendEndPoint+'/courseprogress/'+ECO.appSettings.EcoUserInfo.sub, settings)
      .done(function( data, textStatus, jqXHR ) {
          _private.processServiceResult(data);
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
      });
    },


    updateCourseProgress: function(){
        _private.viewModel.set('showLoadingGif',true);
        var settings={
            crossDomain: true,
            type:'GET',
            headers:{
                Authorization: 'Bearer ' + ECO.appSettings.accessToken
            }
        };

      $.ajax(ECO.appSettings.EcoBackendEndPoint+'/courseprogress/'+ECO.appSettings.EcoUserInfo.sub + '?cached=0', settings)
      .done(function( data, textStatus, jqXHR ) {
        _private.processServiceResult(data);
        _private.viewModel.set('showLoadingGif',false);
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
        _private.viewModel.set('showLoadingGif',false);
      });
    },




    processServiceResult: function (response){
      var result = [];
      for (var i = 0; i < response.length; i++) {
          var courseUrlConcat='?';
          if(response[i].courseUrl.indexOf('?')>0){
              courseUrlConcat='&';
          }
          var userCatchAllUrlConcat='?';
          if ((response[i].platformInfo.userCatchAllUrl||false)){
              if(response[i].platformInfo.userCatchAllUrl.indexOf('?')>0){
                  userCatchAllUrlConcat='&';
              }
          }

          var course = {
                    title: getLanguageString(response[i].title,ECO.language),
                    platformInfo:response[i].platformInfo,
                    href:response[i].courseUrl + courseUrlConcat + 'ecouserid=' + ECO.appSettings.EcoUserInfo.sub,
                    courseImageUrl:response[i].courseImageUrl,
                    progressPercentage:response[i].progressPercentage,
                    firstViewDate:response[i].firstViewDate,
                    shareUrl: ECO.appSettings.portalBaseUrl +'/courses?id=' + encodeURIComponent(response[i].oaiPmhIdentifier) + '&lang=' + ECO.language,
                    deleted: response[i].deleted,
                    userCatchAllUrl: ((response[i].platformInfo.userCatchAllUrl || false) ? response[i].platformInfo.userCatchAllUrl + userCatchAllUrlConcat + 'ecouserid=' + ECO.appSettings.EcoUserInfo.sub  :false),
                    userCatchAllTranslation: ((response[i].platformInfo.userCatchAllUrl||false)?getLanguageString(response[i].platformInfo.userCatchAllTranslations, ECO.language):''),
          };
          result.push(course);
      }
      _private.viewModel.myCourses = new kendo.data.ObservableArray(result);
      _private.myCoursesDataSource.data(_private.viewModel.myCourses);
      return ;
    },


    myCoursesDataSource: new kendo.data.DataSource(),

    BindUIContols: function(){
        _private.loadUserInfo();
        _private.getCourseProgress();
         kendo.bind($("#" + _private.getHtmlID("dashboard")), _private.viewModel);

        _private.courseList = $('#'+ _private.getHtmlID('coursesList')).kendoListView({
            selectable: "single",
            template: kendo.template($('#'+ _private.getHtmlID('myCourseInfo')).html())
        }).data("kendoListView");
        _private.courseList.setDataSource(_private.myCoursesDataSource);

      _private.updateCourseProgress();

    },

    DestroyUIContols: function(){
    },
};

this.init= function (userData){
    _private.BindUIContols();
    $(document).on("loadLanguageEvent.dashboard", function () {
        if($('#'+_private.getHtmlID("dashboard")).length>0){
            _private.getCourseProgress(); // trick to force templates to be redrawn with correct language
        }
    });
};

this.remove= function(){
     try{
        $(document).off("loadLanguageEvent.dashboard");
        _private.DestroyUIContols();
        if (_private.afterRemove !== null){
            _private.afterRemove();
        }
     } catch(err){}
};

};



