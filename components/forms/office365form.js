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

        showProfile:function(){
            $(document).trigger("showProfileEvent");
            _private.commitSuicide();
        },

        createOffice365Account:function(){
        /*
            if((this.get('firstName')== '') || (this.get('lastName')== '') || (this.get('language')== '')){
                bootbox.alert("Please fill your first and last name on your profile as well as your preferred language. We need this information in order to create your office365 account.",function(){
                    $(document).trigger("showProfileEvent");
                    _private.commitSuicide();
                })
            } else
        */
             if((this.get('nrCourses')== 0)){
                bootbox.dialog({
                  title: null,
                  message: ECO.labelTexts.getLabelText(254),
                  animate:true,
                  onEscape: function(){
                        $(document).trigger("showCoursesEvent");
                        _private.commitSuicide();
                  },
                  buttons: {
                      Ok: {
                          label: "Ok",
                          className: "btn-warning btn-lg",
                          callback: function () {
                            $(document).trigger("showCoursesEvent");
                            _private.commitSuicide();
                          }
                      },
                  }
                });

            } else {
                var settings={
                      crossDomain: true,
                      type:'POST',
                      contentType:'application/json',
                      dataType :"json",
                      processData :false,  // we're sending json
                      data:JSON.stringify({
                          formId: "2",
                          formContent:{
                            sub: ECO.appSettings.EcoUserInfo.sub,
                            lang: _private.viewModel.get("language"),
                          }
                      }),
                      headers:{
                          Authorization: 'Bearer ' + ECO.appSettings.accessToken
                      }
                  };

                  $.ajax(ECO.appSettings.EcoBackendEndPoint+'/formsubmit', settings)
                  .done(function( data, textStatus, jqXHR ) {
                      if(data.message == "ERROR"){
                          displayMessage("We're sorry. An error occured while processing your request. Please try again later.");
                      } else if(data.message == "TAKEN"){
                          bootbox.dialog({
                            title: null,
                            message: ECO.labelTexts.getLabelText(253),
                            animate:true,
                            onEscape: function(){
                            },
                            buttons: {
                                Ok: {
                                    label: "Ok",
                                    className: "btn-warning btn-lg",
                                    callback: function () {
                                      $(document).trigger("showCoursesEvent");
                                      _private.commitSuicide();
                                    }
                                },
                            }
                          });

                      } else {
                          var message =  ECO.labelTexts.getLabelText(260);
                          message = message.replace("[email]", ECO.appSettings.EcoUserInfo.email);
                          bootbox.dialog({
                            title: null,
                            message: message,
                            animate:true,
                            onEscape: function(){
                            },
                            buttons: {
                                Ok: {
                                    label: "Ok",
                                    className: "btn-warning btn-lg",
                                    callback: function () {
                                      $(document).trigger("showCoursesEvent");
                                      _private.commitSuicide();
                                    }
                                },
                            }
                          });
                      }
                  })
                  .fail(function( jqXHR, textStatus, errorThrown ) {
                      displayMessage("We're sorry. An error occured while processing your request. Please try again later.");
                  })

            }
        },

        showLoadingGif: false,

        firstName:'',
        middleName:'',
        lastName:'',
        language: ECO.appSettings.EcoUserInfo.language,
        nrCourses:0,
    }),


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
          _private.viewModel.set('nrCourses',data.length);
          _private.viewModel.set('showLoadingGif',false);
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
          _private.viewModel.set('showLoadingGif',false);
      });
    },



    BindUIContols: function(){
         kendo.bind($("#" + _private.getHtmlID("o365form")), _private.viewModel);
         kendo.bind($(".translate"), ECO.labelTexts);
    },

    DestroyUIContols: function(){
    },

};

this.init= function (userData){
    _private.updateCourseProgress();
    _private.BindUIContols();


    _private.viewModel.set('firstName',ECO.appSettings.EcoUserInfo.given_name);
    _private.viewModel.set('middleName',ECO.appSettings.EcoUserInfo.middle_name);
    _private.viewModel.set('lastName',ECO.appSettings.EcoUserInfo.family_name);
    _private.viewModel.set('language',ECO.appSettings.EcoUserInfo.language);

    if (typeof userData.afterRemove !== "undefined") {
        _private.afterRemove = userData.afterRemove
    }


    $(document).on("loadLanguageEvent.o365form", function () {
        _private.BindUIContols();
    });

};

this.remove= function(){
    $(document).off("loadLanguageEvent.o365form");

     try{
        _private.DestroyUIContols();
        if (_private.afterRemove !== null){
            _private.afterRemove();
        }
     } catch(err){}
};





};



