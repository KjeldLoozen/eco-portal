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

        showCourseSuggestions: false,
        titleText:'',


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

    filterCoursesOnLanguage: function(itemValue,filterValue) {
                if(filterValue == ""){
                    return true;
                }

                var f=filterValue.split(",");
                var found = false;
                for (var n=0;n<itemValue.length;n++){
                    if(f.indexOf(itemValue[n])>=0){
                        found = true;
                        break;
                    }
                }
                return found;
    },

    filterCoursesOnCategory: function(itemValue,filterValue) {
                if(filterValue == ""){
                    return true;
                }
                // itemValue contains ECO: prefix
                itemValue = itemValue.split(':')[1];

                var f=filterValue.split(",");
                var found = false;
                if(f.indexOf(itemValue)>=0){
                    found = true;
                }
                return found;
    },

    filterCoursesNoFilter: function(item) {
        return true;
    },

    filterCoursesComingSoonFilter: function(item) {
        // starts in the period: 7 days ago until two weeks ahead
        if(moment(item.startDate).isAfter(moment().subtract(14, 'days')) && moment(item.startDate).isBefore(moment().add(14, 'days')) ){
            return true;
        } else return false;
    },


    menuCoursePreFilter: null,

    applyCoursesFilter: function(){
        var selectedLanguages = _private.languageMultiSelect.value().join();
        var selectedCategories = _private.categoryMultiSelect.value().join();
        _private.allCoursesDataSource.filter([{
            operator: _private.menuCoursePreFilter,
        },{
            field: 'availableLanguageCodes',
            operator: _private.filterCoursesOnLanguage,
            value: selectedLanguages
        },
        {
            field: 'interestAreaCode',
            operator: _private.filterCoursesOnCategory,
            value: selectedCategories
        },
        ]);
    },



    onFilterChange: function(ev){
        _private.applyCoursesFilter();
        return;
    },


    onCourseListChange: function(e) {
        var data = _private.allCoursesDataSource.view();
        var item= data[$(this.select()).index()];
        _private.currentCourse = item.oaiPmhIdentifier;
        _private.showCourseDetails(item);
    },

    onCourseSuggestionListChange: function(e) {
        var data = _private.courseSuggestionDataSource.view();
        var item= data[$(this.select()).index()];
        // lookup this item in the general courselist
        var dataItem = _private.allCoursesDataSource.get(item.oaiPmhIdentifier);
        _private.currentCourse = item.oaiPmhIdentifier;
        _private.showCourseDetails(dataItem);
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

        // init the course suggestion listview in this new html
        _private.courseSuggestionList = $('#courseSuggestionList').kendoListView({
            selectable: "single",
            template: kendo.template($('#'+ _private.getHtmlID('courseSuggestionTemplate')).html()),
            change: _private.onCourseSuggestionListChange,
            dataSource:_private.courseSuggestionDataSource,
        }).data("kendoListView");

        _private.courseSuggestionList.dataSource.read();


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


    courseSuggestionDataSource: new kendo.data.DataSource({
        transport: {
          read: {
            url: (ECO.appSettings.EcoUserInfo?ECO.appSettings.EcoBackendEndPoint + '/coursesuggestions/' + ECO.appSettings.EcoUserInfo.sub:null),
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
                  if (_private.currentCourse !== response[i].oaiPmhIdentifier){ // do not add the currently viewed course
                      var course = {
                        oaiPmhIdentifier:response[i].oaiPmhIdentifier,
                        title: getLanguageString(response[i].title,ECO.language),
                        courseUrl: response[i].courseUrl,
                        courseImageUrl:response[i].courseImageUrl,
                      }
                      result.push(course);
                  }
              }

              _private.viewModel.set("showCourseSuggestions",(result.length == 0?false:true));
              return result;
            }
        }
    }),


    createCourseDataSource: function(top){
        _private.allCoursesDataSource= new kendo.data.DataSource({
            pageSize: 8,
            transport: {
              read: {
                url: (top ? ECO.appSettings.EcoBackendEndPoint + '/courses?top=top': ECO.appSettings.EcoBackendEndPoint + '/courses'),
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
       kendo.bind($(".translate"),ECO.labelTexts);

      _private.pager1 = $('#'+ _private.getHtmlID('pager')).kendoPager({
          dataSource: _private.allCoursesDataSource,
          numeric: true,
          pageSizes: false,
          buttonCount: 3,
          info:false,
      }).data("kendoPager");

      _private.pager2 = $('#'+ _private.getHtmlID('pager2')).kendoPager({
          dataSource: _private.allCoursesDataSource,
          numeric: true,
          pageSizes: false,
          buttonCount: 3,
          info:false,
      }).data("kendoPager");


      _private.languageMultiSelect = $('#'+ _private.getHtmlID('langFilter')).kendoMultiSelect({
          placeholder: '',
          change: _private.onFilterChange,
      }).data("kendoMultiSelect");

      _private.categoryMultiSelect = $('#'+ _private.getHtmlID('AIFilter')).kendoMultiSelect({
          placeholder: '',
          change: _private.onFilterChange,
      }).data("kendoMultiSelect");

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
      _private.applyCoursesFilter();

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
        _private.pager1.destroy();
        _private.pager2.destroy();
        _private.languageMultiSelect.destroy();
        _private.categoryMultiSelect.destroy();
        _private.courseList.destroy();
      } catch(e) {}
    },
};


this.init= function (userData){
    _private.userData = userData;

    if(userData.filter === 'comingSoon'){
        _private.menuCoursePreFilter= _private.filterCoursesComingSoonFilter;
        _private.viewModel.set("titleText",ECO.labelTexts.getLabelText(276));
        _private.createCourseDataSource(false);
    } else if(userData.filter === 'spotlight'){
        _private.menuCoursePreFilter= _private.filterCoursesNoFilter;
        _private.viewModel.set("titleText",ECO.labelTexts.getLabelText(277));
        _private.createCourseDataSource(true);
    } else {
        _private.menuCoursePreFilter= _private.filterCoursesNoFilter;
        _private.viewModel.set("titleText",ECO.labelTexts.getLabelText(275));
        _private.createCourseDataSource(false);
    }

    _private.BindUIControls();

    $(document).on("loadLanguageEvent.allcourses", function () {
        if(_private.userData.filter === 'comingSoon'){
            _private.viewModel.set("titleText",ECO.labelTexts.getLabelText(276));
        } else if(_private.userData.filter === 'spotlight'){
            _private.viewModel.set("titleText",ECO.labelTexts.getLabelText(277));
        } else {
            _private.viewModel.set("titleText",ECO.labelTexts.getLabelText(275));
        }
        _private.allCoursesDataSource.read();


    });

};




this.remove= function(){
     try{
        $(document).off("loadLanguageEvent.allcourses");
        _private.destroyUIControls();
        if (_private.afterRemove !== null){
            _private.afterRemove();
        }
     } catch(err){}
};


};



