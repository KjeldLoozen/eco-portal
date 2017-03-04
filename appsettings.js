// Create Eco Namespace
var ECO = {
    // Global settings, available to all components/screens
    appSettings: {
      version:"D4.36",
      myClientKey: 'xxxxx', // DEV client key
      myRedirect_uri: 'portal_url/cb.html',


      EcoOPAuthorizationEndPoint: 'https://idp_url/authorize',
      EcoOPUserInfoEndPoint: 'https://idp_url/userinfo',
      EcoOPAPIEndPoint: 'https://idp_url/api',

      EcoBackendEndPoint: 'https://backend_url/',


      portalBaseUrl: 'http://portal.com',
      EcoUserInfo:null,

      lastIDPRequestState: null,
      lastIDPRequestNonce: null,
      sendXapiStatements:false,
    }
};
