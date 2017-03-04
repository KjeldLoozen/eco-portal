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

        showLoadingGif: false,
        contentHtml:'',
        newsHtml:'',
        showCourseSuggestions: false,
        titleText:'',


        office365FormClick:function(e){
            if (ECO.appSettings.advertisements){
                ECO.showAdvertisement(1);
            }
        },

        allCoursesClick:function(e){
          componentLoader.loadComponent('body_viewContainer','components/courses/allcourses.html', 'allCoursesComponent',false,{filter:'all'});
        },

        eteacherClick:function(e){
            componentLoader.loadComponent('body_viewContainer','components/forms/teacherform.html', 'teacherFormComponent',false,{});
        },


        gotoCourseClick: function(e){
            // send xAPi statement when navigating to course
            var data = _private.allCoursesDataSource.view();
            var item= data[$(_private.courseList.select()).index()];
            if (ECO.appSettings.EcoUserInfo && ECO.appSettings.EcoUserInfo.sub &&item&&item.oaiPmhIdentifier){
                ECO.sendxApiStatement({
                    actor: ECO.appSettings.EcoUserInfo.sub,
                    verb: "http://adlnet.gov/expapi/verbs/launched",
                    object: {
                        id: item.oaiPmhIdentifier
                    }
                });
            }
        },

        preCourseClick: function(e){
            e.preventDefault();
            $('#'+_private.getHtmlID("courseDetails")).modal('hide');
            var data = _private.allCoursesDataSource.view();
            var item= data[$(_private.courseList.select()).index()];
            window.open("./precourse.html?redirect="+  encodeURIComponent(item.courseUrl)+"&lang="+ECO.language);
            return false;
        },

    }),   // end viewmodel

    courseList:null,
    currentCourse:null,
    userData:null,


    loadContentHtml:function(){
        return;
        debugger;
        _private.viewModel.set('showLoadingGif',true);
        $.ajax(ECO.appSettings.EcoBackendEndPoint+'/wppost/10527?lang='+ECO.language)
        .done(function( data, textStatus, jqXHR ) {
            _private.viewModel.set("contentHtml",data.html  );
            _private.viewModel.set('showLoadingGif',false);
        })
        .fail(function( jqXHR, textStatus, errorThrown ) {
          _private.viewModel.set('showLoadingGif',false);
        });
    },

    onCourseListChange: function(e) {
        var data = _private.allCoursesDataSource.view();
        var item= data[$(this.select()).index()];
        _private.currentCourse = item.oaiPmhIdentifier;
        _private.showCourseDetails(item);
    },



    showCourseDetails: function(item){
        $('#'+_private.getHtmlID("courseDetails")).unbind("hidden.bs.modal");
        $('#'+_private.getHtmlID("courseDetails")).unbind("shown.bs.modal");
        // inject template into modal form
        var template = kendo.template($('#'+_private.getHtmlID("courseDetailInfo")).html());
        var concat='?';
        if(item.courseUrl.indexOf('?')>0){
            concat='&';
        }


        if(ECO.appSettings.EcoUserInfo && ECO.appSettings.EcoUserInfo.sub){
            item.href = item.courseUrl + concat + 'ecouserid=' + ECO.appSettings.EcoUserInfo.sub;
        } else {
            item.href = item.courseUrl;
        }


        var html=template(item);
        $('#'+_private.getHtmlID("courseDetailsModalContent")).html(html);

        // bind this new html content with viewModel
        kendo.bind($('#'+_private.getHtmlID("courseDetailsModalContent")),_private.viewModel);



        $('#'+_private.getHtmlID("courseDetails")).on('shown.bs.modal', function () {
            $('#courseDetailInfoAnchor')[0].scrollIntoView();
        });

        $('#'+_private.getHtmlID("courseDetails")).modal('show');
        $('#courseDetailInfoAnchor')[0].scrollIntoView();

        // send xAPi statement when logged in
        if (ECO.appSettings.EcoUserInfo && ECO.appSettings.EcoUserInfo.sub){
            ECO.sendxApiStatement({
                actor: ECO.appSettings.EcoUserInfo.sub,
                verb: "http://activitystrea.ms/schema/1.0/watch",
                object: {
                    id: item.oaiPmhIdentifier
                }
            });
        }
    },


    createCourseDataSource: function(){
        _private.allCoursesDataSource= new kendo.data.DataSource({
            transport: {
              read: {
                url: ECO.appSettings.EcoBackendEndPoint + '/courses?top=top',
                //url: ECO.appSettings.EcoBackendEndPoint + '/courses?current=current',
                dataType: "json",
              }
            },
            schema: {
                model:{
                    id:"oaiPmhIdentifier",
                },
                parse: function(response) {
                  var result = [];

                  for (var i = 0; i < response.length; i++) {
                      var course = {
                                oaiPmhIdentifier:response[i].oaiPmhIdentifier,
                                title: getLanguageString(response[i].title,ECO.language),
                                platformInfo:response[i].platformInfo,
                                startDate:response[i].startDate,
                                endDate:response[i].endDate,
                                description:getLanguageString(response[i].description,ECO.language),
                                courseUrl: response[i].courseUrl,
                                availableLanguages: _private.translateAvailableLanguages(response[i].language),
                                availableLanguageCodes: response[i].language,
                                duration: _private.translateDuration(response[i].duration),
                                nrOfUnits: response[i].nrOfUnits,
                                interestArea:_private.getInterestArea(response[i].interestArea),
                                interestAreaCode:response[i].interestArea,
                                organizer: (response[i].organizers?response[i].organizers[0]:''),
                                organizers: response[i].organizers,
                                teachers:response[i].teachers,
                                studyLoad:response[i].studyLoad,
                                courseGroup:response[i].courseGroup,
                                courseImageUrl:response[i].courseImageUrl,
                                shareUrl: ECO.appSettings.portalBaseUrl +'/courses?id=' + encodeURIComponent(response[i].oaiPmhIdentifier) + '&lang=' + ECO.language                          }
                      result.push(course);
                  }
                  return result;
                }
            },
        });

    },



    BindUIControls: function(){
        kendo.bind($('#'+_private.getHtmlID("home")), _private.viewModel);
        _private.loadContentHtml();
        kendo.bind($(".translate"),ECO.labelTexts);

        _private.courseList = $('#'+ _private.getHtmlID('coursesList')).kendoListView({
            selectable: "single",
            change: _private.onCourseListChange,
            template: kendo.template($('#'+ _private.getHtmlID('courseShortInfo')).html()),
            dataBound: function() {
                kendo.bind($('#'+_private.getHtmlID("allEcoCourses")), _private.viewModel);
                kendo.bind($(".translate"),ECO.labelTexts);
                // enable touch-scrolling
                $('#'+ _private.getHtmlID('coursesList')).css("touch-action","initial");
            },

        }).data("kendoListView");

        _private.courseList.setDataSource(_private.allCoursesDataSource);
        _private.getNewsFeed();
    },

    getNewsFeed: function(){
        var url=ECO.appSettings.EcoBackendEndPoint+'/rss/' + ECO.language;

        $.ajax({
            url: url,
            dataType: 'text',
            success: function(data){
                var result=[];
                var xmlDoc = $.parseXML(data);
                var items=$(xmlDoc).find('item');

                for(var n=0;(n<5 &&n<items.length);n++){
                    var item= $(items[n]);
                    var rssItem={
                        title:  $(item).find('title').text(),
                        link: $(item).find('link').text(),
                        pubDate: moment($(item).find('pubDate').text()).format('LL'),
                    }
                    result.push(rssItem);
                }

                var newsHtml = '<ul>'
                for(var n=0;n<result.length;n++){
                    newsHtml += '<li><a href="' + result[n].link + '" target="_blank"><span class="e-newstitle">' + result[n].title + '</span></a>' + '<span class="e-newsdate">' + result[n].pubDate + '</span></li>';
                }
                newsHtml += '</ul>';
                _private.viewModel.set('newsHtml',newsHtml);

            },
            error: function(data){
                console.log('Error loading XML data');
            }
        });

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

    destroyUIControls: function(){
      try{
        _private.courseList.destroy();
      } catch(e) {}
    },

}


this.init= function (userData){
    _private.viewModel.set("titleText",ECO.labelTexts.getLabelText(277));
    _private.createCourseDataSource();
    _private.BindUIControls();

    $(document).on("loadLanguageEvent.homeScreen", function () {
        _private.BindUIControls();
    });


};




this.remove= function(){
     try{
         $(document).off("loadLanguageEvent.homeScreen");
        _private.DestroyUIControls();
        if (_private.afterRemove !== null){
            _private.afterRemove();
        }
     } catch(err){}
};


};


