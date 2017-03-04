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
        email: '',
        firstname:'',
        middlename:'',
        lastname:'',
        gender:'',
        birthdate:null,
        postalcode:'',
        city:'',
        country:'',
        language:'',
        interests:new Array(),
        website:'',
        twitterUrl:'',
        facebookUrl:'',
        linkedInUrl:'',
        bio:'',

        updateProfile: function(e){
            var validator = $("#"+_private.getHtmlID("profile")).kendoValidator().data("kendoValidator");
            if (validator.validate()) {
              var settings={
                crossDomain: true,
                type:'PUT',
                contentType:'application/json',
                dataType :"json",
                processData :false,  // we're sending json
                data:JSON.stringify({
                  nickname: _private.viewModel.get('nickname'),
                  given_name: _private.viewModel.get('firstname'),
                  middle_name: _private.viewModel.get('middlename'),
                  family_name: _private.viewModel.get('lastname'),
                  gender: _private.viewModel.get('gender'),
                  birthdate: (_private.viewModel.get('birthdate')?moment(_private.viewModel.get('birthdate')).format("YYYY-MM-DD"):null),
                  language: _private.viewModel.get('language'),
                  postal_code : _private.viewModel.get('postalcode'),
                  locality: _private.viewModel.get('city'),
                  country: _private.viewModel.get('country'),
                  interests: _private.viewModel.get('interests').join(","),
                  website: _private.viewModel.get('website'),
                  twitterUrl: _private.viewModel.get('twitterUrl'),
                  facebookUrl: _private.viewModel.get('facebookUrl'),
                  linkedInUrl: _private.viewModel.get('linkedInUrl'),
                  bio: _private.viewModel.get('bio')
                }),
                headers:{
                    Authorization: 'Bearer ' + ECO.appSettings.accessToken
                }
              };

              $.ajax(ECO.appSettings.EcoOPAPIEndPoint+'/users/'+ECO.appSettings.EcoUserInfo.sub, settings)
              .done(function( data, textStatus, jqXHR ) {
                  var lang = _private.viewModel.get('language');
                  if(lang==='en' ||lang==='fr'||lang==='de'||lang==='es'||lang==='it'||lang==='pt'){
                    ECO.loadLanguage(lang);
                  }
                  displayMessage(ECO.labelTexts.getLabelText(47));
                  // send xAPi statement when profile is updated
                  if (ECO.appSettings.EcoUserInfo && ECO.appSettings.EcoUserInfo.sub){
                      ECO.sendxApiStatement({
                          actor: ECO.appSettings.EcoUserInfo.sub,
                          verb: "http://activitystrea.ms/schema/1.0/update",
                          object: {
                            id:ECO.appSettings.EcoUserInfo.sub,
                          }
                      });
                  }

                  _private.loadUserInfo();
              })
              .fail(function( jqXHR, textStatus, errorThrown ) {
                  displayError(ECO.labelTexts.getLabelText(48));
                  _private.loadUserInfo();
              })
            }
        }
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


    BindUIContols: function(){
         kendo.bind($("#" + _private.getHtmlID("profile")), _private.viewModel);
         kendo.bind($(".translate"),ECO.labelTexts);
    },

    DestroyUIContols: function(){
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
            _private.viewModel.set('email',ECO.appSettings.EcoUserInfo.email);
            _private.viewModel.set('nickname',ECO.appSettings.EcoUserInfo.nickname);
            _private.viewModel.set('firstname',ECO.appSettings.EcoUserInfo.given_name);
            _private.viewModel.set('middlename',ECO.appSettings.EcoUserInfo.middle_name);
            _private.viewModel.set('lastname',ECO.appSettings.EcoUserInfo.family_name);
            _private.viewModel.set('gender',ECO.appSettings.EcoUserInfo.gender);
            _private.viewModel.set('birthdate',(ECO.appSettings.EcoUserInfo.birthdate?moment(ECO.appSettings.EcoUserInfo.birthdate,"YYYY-MM-DD").toDate():null));
            var address=JSON.parse(ECO.appSettings.EcoUserInfo.address);
            _private.viewModel.set('postalcode',address.postal_code||'');
            _private.viewModel.set('city',address.locality||'');
            _private.viewModel.set('country',address.country||'');
            _private.viewModel.set('language',ECO.appSettings.EcoUserInfo.language);
            _private.viewModel.set('interests',ECO.appSettings.EcoUserInfo.interests.split(","));
            _private.viewModel.set('website',ECO.appSettings.EcoUserInfo.website);
            _private.viewModel.set('twitterUrl',ECO.appSettings.EcoUserInfo.twitterUrl);
            _private.viewModel.set('facebookUrl',ECO.appSettings.EcoUserInfo.facebookUrl);
            _private.viewModel.set('linkedInUrl',ECO.appSettings.EcoUserInfo.linkedInUrl);

            // convert "br/>" to \r\n
            var bio=ECO.appSettings.EcoUserInfo.bio;
            bio= bio.replace(/<\s*?br\s*?\/?\s*?>/ig, "\r\n");

            _private.viewModel.set('bio',bio);
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
          displayError(ECO.labelTexts.getLabelText(49));
      });
    },


};

this.init= function (userData){
    _private.loadUserInfo();
    _private.BindUIContols();
    $(document).on("loadLanguageEvent.profile", function () {
        if($('#'+_private.getHtmlID("profile")).length>0){
            _private.BindUIContols();
        }
    });
};

this.remove= function(){
    $(document).off("loadLanguageEvent.profile");
     try{
        if (_private.afterRemove !== null){
            _private.afterRemove();
        }
     } catch(err){}
};





};



