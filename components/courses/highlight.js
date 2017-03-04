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

    viewModel: new kendo.observable({
        getLabelText:function(id){
            return ECO.labelTexts.getLabelText(id);
        },
        preCourseClick: function(e){
            e.preventDefault();
            window.open("./precourse.html?redirect="+  encodeURIComponent(_private.theCourse.courseUrl)+"&lang="+ECO.language);
            return false;
        },

    }),   // end viewmodel

    theCourse: null,

    BindUIControls: function(){
      //setFaceBookMetaTags(courseTitle, fbImageUrl,fbUrl)
     //setFaceBookMetaTags('sMOOC Step by Step', 'http://ecoportal.dev.reimeritsolutions.nl/img/courses/oie_12105611e61F8Srx.png','http://ecoportal.dev.reimeritsolutions.nl/?startup=highlight&id=eu.ecolearning.hub0%3A2');
      var template = kendo.template($('#'+_private.getHtmlID("courseDetailInfo")).html());

      var concat='?';
      if(_private.theCourse.courseUrl.indexOf('?')>0){
          concat='&';
      }

      // inject template into screen
      var html=template(_private.theCourse);
      $('#'+_private.getHtmlID("courseDetails")).html(html);

      // bind this all content with viewModel
      kendo.bind($('#'+_private.getHtmlID("courseDetails")),_private.viewModel);
      kendo.bind($(".translate"),ECO.labelTexts);
    },

    getLanguageString:function(languageStringArray,requestedLanguage){
        if(languageStringArray && languageStringArray.length >0){
          for(var i=0;i<languageStringArray.length;i++){
              if(languageStringArray[i].language===requestedLanguage){
                  return languageStringArray[i].string || '';
              }
          }
          // requested language not found. Try English
          for(var i=0;i<languageStringArray.length;i++){
              if(languageStringArray[i].language==='en'){
                  return languageStringArray[i].string || '';
              }
          }
          // last resort: Give first available language
          return languageStringArray[0].string || '';
        }
    },

    getInterestArea: function(interestArea){
        var result = 'N/A';
        if(interestArea){
          var a= interestArea.substr(4);
          if(a=='ES'){
              result=ECO.labelTexts.getLabelText(40);//'Educational science'
          }
          if(a=='SS'){
              result=ECO.labelTexts.getLabelText(41);//'Social sciences';
          }
          if(a=='HUM'){
              result=ECO.labelTexts.getLabelText(42);//'Humanities';
          }
          if(a=='NSM'){
              result=ECO.labelTexts.getLabelText(43);//'Natural sciences and Mathematics';
          }
          if(a=='BS'){
              result=ECO.labelTexts.getLabelText(44);//'Biomedical Sciences';
          }
          if(a=='TS'){
              result=ECO.labelTexts.getLabelText(45);//'Technological sciences';
          }
        }

        return result;
    },

    translateDuration: function(duration){
        var result='';

        if(duration.years){
            result += duration.years + ' years, ';
        }
        if(duration.months){
            result += duration.months + ' months, ';
        }
        if(duration.days){
            result += duration.days + ' ' + ECO.labelTexts.getLabelText(74) + ', ' ;
        }
        if(duration.hours){
            result += duration.hours + ' ' + ECO.labelTexts.getLabelText(72) + ', ' ;
        }
        if(duration.minutes){
            result += duration.minutes + ' ' + ECO.labelTexts.getLabelText(73) + ', ' ;
        }

        if(result!=''){
            result=result.substring(0,result.length-2);
        } else {
            result='N/A';
        }
      return result;
    },

    translateAvailableLanguages: function(lang){
        var result = new Array();
        if(lang.indexOf('en')>=0){
            result.push('English');
        }
        if(lang.indexOf('de')>=0){
            result.push('Deutsch');
        }
        if(lang.indexOf('fr')>=0){
            result.push('Français');
        }
        if(lang.indexOf('es')>=0){
            result.push('Español');
        }
        if(lang.indexOf('it')>=0){
            result.push('Italiano');
        }
        if(lang.indexOf('pt')>=0){
            result.push('Português');
        }
        if(result.length==0){
            result.push('N/A');
        }
        return result;
    },



    DestroyUIControls: function(){
    },
};

    this.init= function (userData){

    // find course indicated by userData.oaiIdentifier
    var settings={
                crossDomain: true,
                type:'GET',
                contentType:'application/json',
                dataType :"json",
    };

    $.ajax(ECO.appSettings.EcoBackendEndPoint+'/courses', settings)
    .done(function( response, textStatus, jqXHR ) {
        for (var i=0;i<response.length;i++){
            if(response[i].oaiPmhIdentifier===userData.oaiIdentifier){
              _private.theCourse= {
                  oaiPmhIdentifier:response[i].oaiPmhIdentifier,
                  title: _private.getLanguageString(response[i].title,ECO.language),
                  platformInfo:response[i].platformInfo,
                  startDate:response[i].startDate,
                  endDate:response[i].endDate,
                  description:_private.getLanguageString(response[i].description,ECO.language),
                  courseUrl: response[i].courseUrl,
                  availableLanguages: _private.translateAvailableLanguages(response[i].language),
                  duration: _private.translateDuration(response[i].duration),
                  nrOfUnits: response[i].nrOfUnits,
                  interestArea:_private.getInterestArea(response[i].interestArea),
                  organizer: (response[i].organizers?response[i].organizers[0]:''),
                  organizers: response[i].organizers,
                  teachers:response[i].teachers,
                  studyLoad:response[i].studyLoad,
                  courseGroup:response[i].courseGroup,
                  courseImageUrl:response[i].courseImageUrl,
                  shareUrl: ECO.appSettings.portalBaseUrl +'/courses?id=' + response[i].oaiPmhIdentifier + '&lang=' + ECO.language
              }
              _private.BindUIControls();
              $(document).bind("loadLanguageEvent.highlight",function(){
                  _private.BindUIControls();
              });

              break;
            }
        }
    })
    .fail(function( jqXHR, textStatus, errorThrown ) {
    })

};




this.remove= function(){
     $(document).unbind("loadLanguageEvent.highlight");
     try{
        _private.DestroyUIControls();
        if (_private.afterRemove !== null){
            _private.afterRemove();
        }
     } catch(err){}
};


};



