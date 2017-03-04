$(function(){
  jQuery.support.cors=true;

  ECO.language = 'en';

  if (QueryString && QueryString.lang){
    if(QueryString.lang==='de' || QueryString.lang==='es' || QueryString.lang==='pt' || QueryString.lang==='it'||QueryString.lang==='fr'){
        ECO.language=QueryString.lang;
    }
  }

  if (QueryString && QueryString.redirect){
      ECO.redirect=QueryString.redirect;
  }

  ECO.sendAuthenticationRequest =  function(scope) {
      ECO.appSettings.lastIDPRequestState = 'preQS' + Date.now()+100*Math.random();
      ECO.appSettings.lastIDPRequestNonce = 'preQN' + Date.now()+150*Math.random();

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
      $("#idp_screens").addClass("show");
      $("#idp_iframe").attr("src",url);  // send authentication request
  }

  ECO.showBackdrop =function(){
    $("div#portalBackdrop").remove();
    $("body").append('<div id="portalBackdrop"style="position: fixed;top: 0;right: 0;bottom: 0;left: 0;z-index: 1030;background-color: #000000;opacity:0.7"></div>');
  }

  ECO.removeBackdrop =function(){
    $("div#portalBackdrop").remove();
  }


  // Let's start....
  ECO.sendAuthenticationRequest('openid profile email address eco');




});


// global function
function loginCallback(params){

    $("#idp_iframe").removeAttr("src");
      $("#idp_screens").removeClass("show");

      if(params.error && params.error !=''){
          if (params.error === 'access_denied'){
              window.close();
          } else {
              displayIDPError(params.error, decodeURIComponent(params.error_description) || '');
              return;
          }
      } else if(params.id_token){
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

          // redirect to the course
          var concat='?';
          if(ECO.redirect.indexOf('?')>0){
              concat='&';
          }

          if(id_token.sub){
              ECO.redirect += concat + 'ecouserid=' + id_token.sub;
              window.location.replace(ECO.redirect);
              /*
              if(opener){
                opener.silentLogin();
              }
              */
          } else {
              displayError('Invalid userid');
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








