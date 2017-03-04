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
        showForm :function(){
            // check on being logged in
            if(ECO.appSettings.EcoUserInfo && ECO.appSettings.EcoUserInfo.sub){
                $("#" + _private.getHtmlID("page1")).hide();
                $("#" + _private.getHtmlID("page2")).fadeIn();
                $("#" + _private.getHtmlID("page2"))[0].scrollIntoView();
            } else {
                //displayMessage(ECO.labelTexts.getLabelText(173));
                                bootbox.dialog({
                                  title: null,
                                  message: ECO.labelTexts.getLabelText(173),
                                  animate:true,
                                  onEscape: function(){
                                  },
                                  buttons: {
                                      Ok: {
                                          label: "Ok",
                                          className: "btn-warning btn-lg",
                                          callback: function () {
                                              $("#body_btnLogin").click();
                                          }
                                      },
                                  }
                                });

            }
        },

        showIntro:function(){
            $("#" + _private.getHtmlID("page2")).hide();
            $("#" + _private.getHtmlID("faq")).hide();
            $("#" + _private.getHtmlID("page1")).fadeIn();
            $("#" + _private.getHtmlID("page1"))[0].scrollIntoView();

        },
        showfaq:function(){
            $("#" + _private.getHtmlID("page1")).hide();
            $("#" + _private.getHtmlID("faq")).fadeIn();
            $("#" + _private.getHtmlID("faq"))[0].scrollIntoView();
        },

        faqhtml:"",
        introHtml:"",
        showLoadingGif:false,

        submitForm:function(){
            if (_private.validator.validate()) {
                  var settings={
                      crossDomain: true,
                      type:'POST',
                      contentType:'application/json',
                      dataType :"json",
                      processData :false,  // we're sending json
                      data:JSON.stringify({
                          formId: "1",
                          formContent:{
                            AreYouATeacher: _private.viewModel.get('teacherYesNo'),
                            WhatDoYouTeach: _private.viewModel.get('whatdoyouteach'),
                            AtWhatEducationalLevelDoYouTeach: _private.viewModel.get('educationlevel'),
                            WhichAreYourCompletedMoocs: _private.viewModel.get('completedMoocs'),
                            JoinExistingGroupOrCreateNewMooc: _private.viewModel.get('joinorcreate'),
                            YourMoocCategory: _private.viewModel.get('category'),
                            YourTentativeMoocTitle: _private.viewModel.get('title'),
                            YourMoocTopic: _private.viewModel.get('topic'),
                            YourMoocLanguages: _private.viewModel.get('languages'),
                            YourMoocEducationalLevel: _private.viewModel.get('mooclevel'),
                            LearningObjectives: _private.viewModel.get('learningObjectives'),
                            ShortDescription: _private.viewModel.get('shortDescription'),
                            RecommendedRequirements: _private.viewModel.get('recommendedRequirements'),
                            TargetAudience: _private.viewModel.get('targetAudience'),
                            MoocOfferedBeforeYesNo: _private.viewModel.get('moocOfferedBeforeYesNo'),
                            Resources: _private.viewModel.get('resources'),
                            CoTeachers: _private.viewModel.get('coteachers'),
                            OtherComments: _private.viewModel.get('othercomments'),
                          }
                      }),
                      headers:{
                          Authorization: 'Bearer ' + ECO.appSettings.accessToken
                      }
                  };

                  $.ajax(ECO.appSettings.EcoBackendEndPoint+'/formsubmit?id=156&lang='+ ECO.language, settings)
                  .done(function( data, textStatus, jqXHR ) {
                      bootbox.alert(ECO.labelTexts.getLabelText(144), function() {
                          $('#body_btnAllcourses').click();
                      });
                  })
                  .fail(function( jqXHR, textStatus, errorThrown ) {
                      displayMessage(ECO.labelTexts.getLabelText(154));
                  })
            }
        },

        showsMoocDetails: function(){
            return (_private.viewModel.get('joinorcreate') === 'create');
        },

        showSubmitJoin: function(){
            return (_private.viewModel.get('joinorcreate') === 'join');
        },

        showTeacherQuestions: function(){
            return (_private.viewModel.get('teacherYesNo') === 'yes');
        },



        teacherYesNo: "yes",
        whatdoyouteach:'',
        educationlevel:'PrimaryEducation',
        completedMoocs: [],
        joinorcreate:"",
        title:'',
        topic:'',
        languages:[],
        mooclevel:'PrimaryEducation',
        category:'Educational science',
        learningObjectives:'',
        shortDescription:'',
        recommendedRequirements:'',
        targetAudience:'',
        moocOfferedBeforeYesNo:"no",
        resources:[],
        coteachers:'',
        othercomments:'',
    }),

    loadFaqHtml:function(){
        return;
        _private.viewModel.set('showLoadingGif',true);
        $.ajax(ECO.appSettings.EcoBackendEndPoint+'/wppost/11169?lang='+ECO.language)
        .done(function( data, textStatus, jqXHR ) {
          debugger;
            _private.viewModel.set("faqhtml",data.html  );
            _private.viewModel.set('showLoadingGif',false);
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
          _private.viewModel.set('showLoadingGif',false);
        });
    },

    loadIntroHtml: function(){
        return;
        _private.viewModel.set('showLoadingGif',true);
        $.ajax(ECO.appSettings.EcoBackendEndPoint+'/wppost/10993?lang='+ECO.language)
        .done(function( data, textStatus, jqXHR ) {
          debugger;
            _private.viewModel.set("introHtml",data.html  );
            _private.viewModel.set('showLoadingGif',false);
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
          _private.viewModel.set('showLoadingGif',false);
        });
    },




    BindUIContols: function(){
        _private.loadIntroHtml();
         kendo.bind($("#" + _private.getHtmlID("teacherform")), _private.viewModel);
         kendo.bind($(".translate"), ECO.labelTexts);
         _private.validator = $("#" + _private.getHtmlID("page2")).kendoValidator({
            rules: {
                course: function(input) {
                    if (input.filter("input[name=course]").length >0 ) {
                        return ($("#" + _private.getHtmlID("page2")).find('input[value="sMOOC Step by Step"]:checked').length ==1)  && ($("#" + _private.getHtmlID("page2")).find("input[name=course]:checked").length >=1)
                    }
                    return true;
                },


                title: function(input){
                    if ((input.filter("input[name=title]").length >0 ) ){
                        if ($("#" + _private.getHtmlID("page2")).find("input[name=joinorcreate]:checked").val() == "create"){
                            return ($("#" + _private.getHtmlID("page2")).find("input[name=title]").val() !== "");
                        }
                    }
                    return true;
                },

                lang: function(input) {
                    if (input.filter("input[name=lang]").length >0 ) {
                        if ($("#" + _private.getHtmlID("page2")).find("input[name=joinorcreate]:checked").val() == "create"){
                            return $("#" + _private.getHtmlID("page2")).find("input[name=lang]").is(":checked");
                        }
                    }
                    return true;
                },


                topic: function(input){
                    if ((input.filter("input[name=topic]").length >0 ) ){
                        if ($("#" + _private.getHtmlID("page2")).find("input[name=joinorcreate]:checked").val() == "create"){
                            return ($("#" + _private.getHtmlID("page2")).find("input[name=topic]").val() !== "");
                        }
                    }
                    return true;
                },


                learningObjectives: function(input) {
                    if (input.filter("input[name=learningObjectives]").length >0 ) {
                        if ($("#" + _private.getHtmlID("page2")).find("input[name=joinorcreate]:checked").val() == "create"){
                            return ($("#" + _private.getHtmlID("page2")).find("input[name=learningObjectives]").val() !== "");
                        }
                    }
                    return true;
                },

                shortDescription: function(textarea) {
                    if (textarea.filter("textarea[name=shortDescription]").length >0 ) {
                        if ($("#" + _private.getHtmlID("page2")).find("input[name=joinorcreate]:checked").val() == "create"){
                            return ($("#" + _private.getHtmlID("page2")).find("textarea[name=shortDescription]").val() !== "");
                        }
                    }
                    return true;
                },

                recommendedRequirements: function(textarea) {
                    if (textarea.filter("textarea[name=recommendedRequirements]").length >0 ) {
                        if ($("#" + _private.getHtmlID("page2")).find("input[name=joinorcreate]:checked").val() == "create"){
                            return ($("#" + _private.getHtmlID("page2")).find("textarea[name=recommendedRequirements]").val() !== "");
                        }
                    }
                    return true;
                },

                targetAudience: function(input) {
                    if (input.filter("input[name=targetAudience]").length >0 ) {
                        if ($("#" + _private.getHtmlID("page2")).find("input[name=joinorcreate]:checked").val() == "create"){
                            return ($("#" + _private.getHtmlID("page2")).find("input[name=targetAudience]").val() !== "");
                        }
                    }
                    return true;
                },



            },
             messages: {
                lang: ECO.labelTexts.getLabelText(149),
                required: ECO.labelTexts.getLabelText(148),
                course: ECO.labelTexts.getLabelText(181),
                title: ECO.labelTexts.getLabelText(148),
                topic: ECO.labelTexts.getLabelText(148),
                learningObjectives: ECO.labelTexts.getLabelText(148),
                shortDescription: ECO.labelTexts.getLabelText(148),
                recommendedRequirements: ECO.labelTexts.getLabelText(148),
                targetAudience: ECO.labelTexts.getLabelText(148),
             }
         }).data("kendoValidator");

         _private.viewModel.bind("change", function(e) {
            if (e.field==="teacherYesNo"){
                _private.validator.validateInput($("input[name=teacherYesNo]"));
            }
         });

         _private.loadFaqHtml();
    },

    DestroyUIContols: function(){
    },

    validator:null,

};

this.init= function (userData){
    _private.BindUIContols();
    $(document).on("loadLanguageEvent.teacherform", function () {
        _private.BindUIContols();
    });

};

this.remove= function(){
    $(document).off("loadLanguageEvent.teacherform");

     try{
        _private.DestroyUIContols();
        if (_private.afterRemove !== null){
            _private.afterRemove();
        }
     } catch(err){}
};





};



