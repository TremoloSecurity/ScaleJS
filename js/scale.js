(function(){
  var app = angular.module('scale',[]);

  var config =
  {
    displayNameAttribute:"cn",
    frontPage : {
      title : "Scale Main Page",
      text : "Here are your apps, request access...if you dare!!!!!!"
    },
    canEditUser : false,
    attributes : {
      "uid":{
        name : "uid",
        displayName:"Login ID",
        readOnly:true
      },
      "l":{
        name : "l",
        displayName:"Location",
        readOnly:true
      },
      "sn": {
        name : "sn",
        displayName:"Last Name",
        readOnly:true
      },
      "cn":{
        name : "cn",
        displayName:"Full Name",
        readOnly:true
      }
    }

  };

  var user =
    {
      "uid":"testsaml2",
      "dn":"uid\u003dtestsaml2,ou\u003dinternal,ou\u003dGenericLDAP,o\u003dTremolo",
      "directory":"GenericLDAP",
      "attributes":
        [
          {"values":["testsaml2"],"name":"uid"},
          {"values":["Boston"],"name":"l"},
          {"values":["SAML2"],"name":"sn"},
          {"values":["Test SAML2"],"name":"cn"},
          {"values":["inetOrgPerson"],"name":"objectClass"}
        ],
      "groups":["This is my role","and it is mine"]
    };

    var openApprovals =
        [
          {
            "workflow":1,
            "approval":1,
            "label":"Approve Access to LDAP",
            "user":"testsaml10",
            "wfStart":1392512787000,
            "approvalStart":1392512788000,
            "wfName":"testApproval",
            "wfDescription":"Select this workflow if you don\u0027t have access to the portal",
            "wfLabel":"Gain access to the portal",
            "reason":"this is a test workflow webservice"
          }
        ]

    app.controller('ScaleController',function(){
      this.config = config;
      this.attributes = {};
      this.currentTab = 'home';
      this.cart = [];
      this.approvals = openApprovals;
      this.reports = [""];
      this.user = user;
      //Initialize the attributes
      for (var i in user.attributes) {
        this.attributes[user.attributes[i].name] = user.attributes[i].values[0];
      }

      this.cart.push(0);
      this.cart.push(1);
      this.cart.push(2);

      //Methods
      this.displayName = function() {
        val = this.attributes[this.config.displayNameAttribute];
        if (val == null) {
          return "No User Loaded";
        } else {
          return val;
        }
      };

      this.isSelectedTab = function(val) {
        return val == this.currentTab;
      };

      this.setSelectedTab = function(val) {
        this.currentTab = val;
      };


    });
})();
