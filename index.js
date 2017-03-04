$(function(){
  jQuery.support.cors=true;

  ECO.semaphores={};
  ECO.semaphores.popUpAdvertShowing = false;

  ECO.labelTexts= kendo.observable({   // = viewmodel
    texts:{},

    getLabelText:function(id){
        if(id==null ){
            return '-';
        }
        return this.get('texts['+id+']');
    }

  });


  ECO.loadLanguage=function (language){
      var deferred = new $.Deferred();
      var settings={
          crossDomain: true,
          type:'GET',
      };

      $.ajax(ECO.appSettings.EcoBackendEndPoint + '/translations?language='+language, settings)
      .done(function( data, textStatus, jqXHR ) {
          ECO.labelTexts.set('texts',{});
          var trans = {};
          for(var i=0;i<data.length;i++){
              trans[data[i].id] =data[i].text;
          }
          ECO.labelTexts.set('texts', trans);
          ECO.language = language;
          moment.locale(ECO.language);

          $(document).trigger("loadLanguageEvent");
          deferred.resolve();
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
        deferred.reject();
      });

      return deferred.promise();
  }

  ECO.getBrowserLanguage=function(){
      var deferred = new $.Deferred();
      var settings={
          crossDomain: true,
          type:'GET',
      };

      $.ajax(ECO.appSettings.EcoBackendEndPoint + '/browserlanguage', settings)
      .done(function( data, textStatus, jqXHR ) {
          var lang='en';
          try {
            var l=data.split(',');
            for (var i=0; i < l.length; i++){
              if(l[i].indexOf(';') === -1){
                  l[i] += ';q=1.0'
              }
            }
            l.sort(sortQvalue);

            var haystack = "en es fr it pt de";
            for (var i=0; i < l.length; i++){
              var needle=l[i].substring(0,2).toLowerCase();
              if (haystack.indexOf(needle) >= 0){
                  lang=needle;
                  break;
              }
            }
          } catch(e) {
            lang='en'
          }

          if(!ECO.language){  // if a language was forced by url parameter 'lang', do not overwrite
              ECO.language = lang;
          }
          moment.locale(ECO.language);
          deferred.resolve();

          function sortQvalue(a,b){
            a.indexOf('q=')
            var q1=a.substr(a.indexOf('q=')+2);
            q1=parseFloat(q1);
            var q2=b.substr(b.indexOf('q=')+2);
            q2=parseFloat(q2);
            return q2-q1;
          }
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
        deferred.reject();
      })
      return deferred.promise();
  }

  ECO.showBackdrop =function(){
    $("div#portalBackdrop").remove();
    $("body").append('<div id="portalBackdrop"style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 1030;background-color: #000000;opacity:0.7"></div>');
  }

  ECO.removeBackdrop =function(){
    $("div#portalBackdrop").remove();
  }

  ECO.sendAuthenticationRequest =  function(scope) {
      ECO.appSettings.lastIDPRequestState = 'ePrtS' + Date.now()+100*Math.random();
      ECO.appSettings.lastIDPRequestNonce = 'ePrtN' + Date.now()+150*Math.random();

      var data = {
        response_type: 'id_token token',
        scope: scope,
        client_id: ECO.appSettings.myClientKey,
        state: ECO.appSettings.lastIDPRequestState,
        redirect_uri: ECO.appSettings.myRedirect_uri,
        nonce: ECO.appSettings.lastIDPRequestNonce,
        ui_locales:ECO.language
      };

      var url = ECO.appSettings.EcoOPAuthorizationEndPoint + "?" + $.param(data);
      if(!ECO.autologin){
        ECO.showBackdrop();
        $("#idp_screens").addClass("show");
      }
      $("#idp_iframe").attr("src",url);  // send authentication request
  }

  ECO.sendxApiStatement = function(params){
    if(ECO.appSettings.sendXapiStatements){
      var settings={
          crossDomain: true,
          type:'POST',
          contentType:'application/json',
          dataType :"json",
          processData :false,  // we're sending json
          data:JSON.stringify({
            actor: params.actor,
            verb: params.verb,
            object: params.object
          }),
          headers:{
              Authorization: 'Bearer ' + ECO.appSettings.accessToken
          }
      };

      $.ajax(ECO.appSettings.EcoBackendEndPoint+'/xapi', settings)
      .done(function( data, textStatus, jqXHR ) {
          //displayMessage("xApi statement sent");
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
        // fail silently
      })
    }
  }

  ECO.getAdvertisements = function(){
      var settings={
          crossDomain: true,
          type:'GET',
          contentType:'application/json',
          dataType :"json",
          processData :false,  // we're sending json
      }

      $.ajax(ECO.appSettings.EcoBackendEndPoint+'/advertisements', settings)
      .done(function( data, textStatus, jqXHR ) {
          ECO.appSettings.advertisements = data;
      })
      .fail(function( jqXHR, textStatus, errorThrown ) {
          ECO.appSettings.advertisements = null;
      });
  }


  ECO.showPopupAdvertisement = function(){
      var findFirstAdvert = function (){
          // for now, quick solution beause there's only one advert, nr 1.
          // in the future: check all availabe adverts and return  the first one that is allowed to show

          var deferred = new $.Deferred();
          var settings={
              crossDomain: true,
              type:'GET',
          };

          $.ajax(ECO.appSettings.EcoBackendEndPoint+'/showAdvertPopup?sub='+ECO.appSettings.EcoUserInfo.sub+'&id=1', settings)
          .done(function( data, textStatus, jqXHR ) {
              deferred.resolve((data.showPopup===false?false:1));
          })
          .fail(function( jqXHR, textStatus, errorThrown ) {
              deferred.resolve(false);
          });
          return deferred.promise();
      }

      // show popup advertisement, when applicable
      $.when(findFirstAdvert())
      .then(function(nr){  // false or number
          if(nr){
              ECO.showAdvertisement(nr);
          }
      });

  }




  // Startup!
  //
  // store startup url params
  ECO.language = null;
  if (QueryString && QueryString.lang){
    if(QueryString.lang==='de' || QueryString.lang==='es' || QueryString.lang==='pt' || QueryString.lang==='it'||QueryString.lang==='fr' ||QueryString.lang==='en'){
        ECO.language=QueryString.lang;
    }
  }
  ECO.startupAction = null;
  if (QueryString && QueryString.startup){
    if(QueryString.startup==='profile' ){
        ECO.startupAction=QueryString.startup;
    }
    if(QueryString.startup==='login' ){
        ECO.startupAction=QueryString.startup;
    }

    if(QueryString.startup==="highlight") {
        if(QueryString.id) {
            try {
                var oai = decodeURIComponent(QueryString.id);
                ECO.startupAction = QueryString.startup;
                ECO.highlightCourseOai = oai;
            } catch(e) {
            }
        }
    }

    if(QueryString.startup==='noautologin' ){
        ECO.startupAction=QueryString.startup;
    }

    if(QueryString.startup==='eteacherinfo' ){
        ECO.startupAction=QueryString.startup;
    }

  }

  $("#splashScreen").modal('show');
  $('#splashScreen').on('hidden.bs.modal', function (e) {
      $("#splashScreen").remove();
  });

  // No advertisements
  // ECO.getAdvertisements();

  $.when(ECO.getBrowserLanguage()).then(
      function(){
        $.when(   // JQuery promise handling
          ECO.loadLanguage(ECO.language)
        ).then(
          function(){
            componentLoader.loadComponent('body','components/app.html', 'app',false,{});
            setTimeout(function(){
              $("#splashScreen").modal('hide');
            }, 500);
          });
      },
      function(){
        displayMessage('An error occurred connecting to the ECO platform. Please try again and reload this page.');
      }
  );

});



//
// Global functions
//
function loginCallback(params){
    $("#idp_iframe").removeAttr("src");
    if(!ECO.autologin){
      $("#idp_screens").removeClass("show");
      ECO.removeBackdrop();

      if(params.error && params.error !=''){
          if (params.error === 'access_denied'){
              displayMessage(decodeURIComponent(params.error_description));
              return;
          } else {
              displayIDPError(params.error, decodeURIComponent(params.error_description) || '');
              return;
          }
      } else if(params.id_token){
          // looks like we got an authentication response back.
          // let's check it.

          // check the state
          if (!params.state || ECO.appSettings.lastIDPRequestState !== params.state){
              displayError('Error logging in.(IDP reported a different state)');
              return;
          }

          // check id_token and nonce inside it.
          var id_token = JSON.parse(window.atob(params.id_token.split(".")[1]))

          // TODO: Validate id_token: check signature

          // check the aud
          if (!id_token.aud || ECO.appSettings.myClientKey !== id_token.aud){
              displayError('Error logging in.(IDP reported a different aud claim)');
              return;
          }

          if(!id_token.nonce ||id_token.nonce !== ECO.appSettings.lastIDPRequestNonce){
              displayError('Error logging in.(IDP reported a different nonce)');
              return;
          }

          // save the accesstoken and sub
          ECO.appSettings.accessToken = params.access_token;
          ECO.appSettings.idToken = id_token;

          // access userinfo endpoint
          var settings={
              crossDomain: true,
              type:'GET',
              headers:{
                  Authorization: 'Bearer ' + ECO.appSettings.accessToken
              }
          };

         ECO.appSettings.EcoUserInfo=null;
          $.ajax(ECO.appSettings.EcoOPUserInfoEndPoint, settings)
          .done(function( data, textStatus, jqXHR ) {
              // we're logged in, and have userinfo
              ECO.appSettings.EcoUserInfo = data;
              // set the user's preferred language, show welcomemessage, etc
              ECO.afterLogin();
          })
          .fail(function( jqXHR, textStatus, errorThrown ) {
              displayError('Error logging in.(Error recieving userinfo)');
              return;
          })
      }
    } else { // process auto login result: no user interaction
      ECO.autologin=false;
      if(params.error && params.error !=''){
        return;
      } else if(params.id_token){
          if (!params.state || ECO.appSettings.lastIDPRequestState !== params.state){
              return;
          }
          var id_token = JSON.parse(window.atob(params.id_token.split(".")[1]))
          if (!id_token.aud || ECO.appSettings.myClientKey !== id_token.aud){
              return;
          }

          if(!id_token.nonce ||id_token.nonce !== ECO.appSettings.lastIDPRequestNonce){
              return;
          }

          ECO.appSettings.accessToken = params.access_token;
          ECO.appSettings.idToken = id_token;
          var settings={
              crossDomain: true,
              type:'GET',
              headers:{
                  Authorization: 'Bearer ' + ECO.appSettings.accessToken
              }
          };

         ECO.appSettings.EcoUserInfo=null;
          $.ajax(ECO.appSettings.EcoOPUserInfoEndPoint, settings)
          .done(function( data, textStatus, jqXHR ) {
              ECO.appSettings.EcoUserInfo = data;
              // set the user language
              ECO.afterLogin();
          })
          .fail(function( jqXHR, textStatus, errorThrown ) {
              return;
          })
      }
    }
}

function displayIDPError(error, description){
    bootbox.alert('Sorry.... The IDP returned an error.<br/>This is the error information I got from the ECO IDP:<br/><br/>Error_code: '
        + error + '<br/>error_description: ' + description);
}

function displayError(description){
    bootbox.alert("We're sorry. The following error ocurred:<br/><br/>" +description);
}

function displayMessage(description){
    bootbox.alert(description);
}

function silentLogin(){
      ECO.autologin = true;  //flag for loginCallback indicating auto login attempt: No user interaction
      ECO.sendAuthenticationRequest('openid profile email address eco');
}


function getLanguageString(languageStringArray,requestedLanguage){
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
}

function setFaceBookMetaTags(courseTitle, fbImageUrl,fbUrl){
    var html= '<meta property="og:title" content="' + courseTitle +'"/>';
    html+= '<meta property="og:image" content="' + fbImageUrl + '"/>'
    html+= '<meta property="og:url" content="' + fbUrl + '"/>'
    html+= '<meta property="og:site_name" content="ECO: Elearning, communication and Open Data"/>'
    html+= '<meta property="og:type" content="website"/>'
    $('head').append(html);
}

function removeFaceBookMetaTags(){
}

