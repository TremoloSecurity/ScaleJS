/*
Copyright 2015 Tremolo Security, Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
(function(){
  var app = angular.module('scale',['angularTreeview']);

  var config =
  {
    displayNameAttribute:"cn",
    frontPage : {
      title : "Scale Main Page",
      text : "Here are your apps, request access...if you dare!!!!!!"
    },
    canEditUser : true,
    workflowName : "Role",
    attributes : {
      "uid":{
        name : "uid",
        displayName:"Login ID",
        readOnly:true
      },
      "l":{
        name : "l",
        displayName:"Location",
        readOnly:false
      },
      "sn": {
        name : "sn",
        displayName:"Last Name",
        readOnly:true
      },
      "cn":{
        name : "cn",
        displayName:"Full Name",
        readOnly:false
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
        ];

    var approvalDetails =
        {
          "userObj":
            {
              "userID":"testsaml10",
              "displayName":"Test Saml 10",
              "groups":['Role 1','Role 2'],
              "resync":false,
              "keepExternalAttrs":false,
              "JitAddToAuditDB":true,
              "requestReason":"this is a test workflow webservice",
              "attribs":
                {
                  "uid":
                    {
                      "values":["testsaml10"],
                      "name":"uid",
                      "label":"User Name"
                    },
                  "l":
                    {
                      "values":["Boston"],
                      "name":"l",
                      "label":"Location"
                    },
                  "sn":
                    {
                      "values":["SAML5"],
                      "name":"sn",
                      "label":"Last Name"
                    },
                  "cn":
                    {
                      "values":["Test SAML5"],
                      "name":"cn",
                      "label":"Full Name"
                    }
                }
            },
            "workflow":1,
            "approval":1,
            "label":"Approve Access to LDAP",
            "user":"testsaml10",
            "wfStart":1392513182000,
            "approvalStart":1392513182000,
            "wfName":"testApproval",
            "wfDescription":"Select this workflow if you don\u0027t have access to the portal",
            "wfLabel":"Gain access to the portal",
            "reason":"this is a test workflow webservice",
            "justification":""
        };

    var wfSubject =
        {
          "uid":"testsaml10",
          "dn":"uid\u003dtestsaml10,ou\u003dinternal,ou\u003dGenericLDAP,o\u003dTremolo",
          "directory":"GenericLDAP",
          "attributes":
            [
              {"values":["testsaml10"],"name":"uid"},
              {"values":["Boston"],"name":"l"},
              {"values":["SAML10"],"name":"sn"},
              {"values":["Test SAML10"],"name":"cn"},
              {"values":["inetOrgPerson"],"name":"objectClass"}
            ],
          "groups":["linkedSAMLUsers"]
        };

    var orgs =
    {
      id:"{123-456-7890123SDF}",
      name:"Root",
      description:"Root of all organizations",
      subOrgs:
        [
          {
            "id":"{123-456-7890123SDFx}",
            "name":"Org1",
            "description":"First organization",
            "subOrgs":[]
          },
          {
            "id":"{123-456-7890123SDFy}",
            "name":"Org2",
            "description":"Second organization",
            "subOrgs":[]
          }

        ]
    };

    var workflows = {
      "{123-456-7890123SDF}": [
        {
        "name":"wf1",
        "label":"Application 1",
        "description":"Workflow to request application1",
        inCart:false
        },
        {
          "name":"wf2",
          "label":"Application 2",
          "description":"Workflow to request application2",
          inCart:false
        }
      ],

      "{123-456-7890123SDFx}": [
        {
        "name":"wf3",
        "label":"Application 3",
        "description":"Workflow to request application3",
        inCart:false
        }
      ]
    };

    app.controller('ScaleController',['$compile', '$scope','$window',function($compile, $scope, $window){
      this.config = config;
      this.attributes = {};
      this.currentTab = 'home';
      this.cart = {};
      this.approvals = openApprovals;
      this.reports = [""];
      this.user = user;
      this.orgs = [orgs];
      this.completedWorkflows = ['wf1','wf3'];
      this.workflows = workflows;
      this.approvalSub = false;
      this.approvalConfirm = false;

      this.requestAccessCurrentNode = this.orgs[0];
      this.requestAccessCurentWorkflows = this.workflows[this.requestAccessCurrentNode.id];

      this.rowNumber = 0;
      this.currentApproval = approvalDetails;

      //Initialize the attributes
      for (var i in user.attributes) {
        this.attributes[user.attributes[i].name] = user.attributes[i].values[0];
      }


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
        this.rowNumber = 0;
        this.approvalSub = false;
      };

      this.selectRequestAccessOrg = function(node) {
        this.requestAccessCurrentNode = node;
        this.requestAccessCurentWorkflows = this.workflows[this.requestAccessCurrentNode.id];
      };

      this.isWorkflowCompleted = function(name) {
        if(typeof Array.prototype.indexOf === 'function') {
          indexOf = Array.prototype.indexOf;
        } else {
            indexOf = function(name) {
                var i = -1, index = -1;

                for(i = 0; i < this.length; i++) {
                    if(this[i] === name) {
                        index = i;
                        break;
                    }
                }

                return index;
            };
        }

        return indexOf.call(this.completedWorkflows, name) > -1;
      };

      this.toggleWorkflow = function(workflow) {
        if (workflow.inCart) {
          workflow.inCart = false;
          delete this.cart[workflow.name];
        } else {
          workflow.inCart = true;
          this.cart[workflow.name] = workflow;
        }
      };

      this.cartLinkLabel = function(workflow) {
        if (workflow.inCart) {
          return "Remove From Cart";
        } else {
          return "Add To Cart";
        }
      };

      this.isCartEmpty = function() {
        return this.numItemsInCart() == 0;
      };

      this.numItemsInCart = function() {
        i = 0;
        for(var key in this.cart) {
          if (this.cart.hasOwnProperty(key)) {
             i++;
          }
         }
         return i;
      };

      this.getRowColor = function() {
        if (this.rowNumber % 2 == 0) {
          this.rowNumber++;
          return "#eee";
        } else {
          this.rowNumber++;
          return "#f9f9f9";
        }
      };

      this.isMobile = function() {
        var ow = $window.outerWidth;
        var mobile = (ow <= 991);
        return ! mobile;
      };

      this.reviewApproval = function(approval) {
        this.approvalSub = true;
        this.approvalConfirm = false;
        this.approvalError = false;
        this.approvalErrors = [];
      };

      this.isApprovalSub = function() {
        return this.approvalSub;
      };

      this.isApprovalConfirm = function() {
        return this.approvalConfirm;
      };

      this.checkApprovalRequest = function() {
        if (! this.currentApproval.justification || this.currentApproval.justification === "") {
          this.approvalError = true;
          this.approvalErrors = [];
          this.approvalErrors.push("Justification is required");
          return false;
        } else {
          this.approvalError = false;
          this.approvalErrors = [];
          return true;
        }
      }

      this.confirmApproval = function() {

        if (this.checkApprovalRequest()) {
          this.approvalConfirm = true;
          this.currentApproval.isApproved = true;
        }
      }

      this.confirmDenial = function() {
        if (this.checkApprovalRequest()) {
          this.approvalConfirm = true;
          this.currentApproval.isApproved = false;
        }
      }

      this.isApprovalError = function() {
        return this.approvalError;
      }

      this.getConfirmLabel = function() {
        if (this.currentApproval.isApproved) {
          return "Approval";
        } else {
          return "Denial";
        }
      }

    }]);



    app.controller('SaveUserController',function(){
      this.userToSave = {};

      for (var i in user.attributes) {
        this.userToSave[user.attributes[i].name] = {
          name : user.attributes[i].name,
          value : user.attributes[i].values[0]
        };



      }
    });
})();

(function(f){f.module("angularTreeview",[]).directive("treeModel",function($compile){return{restrict:"A",link:function(b,h,c){var a=c.treeId,g=c.treeModel,e=c.nodeLabel||"label",d=c.nodeChildren||"children",e='<ul><li data-ng-repeat="node in '+g+'"><i class="collapsed" data-ng-show="node.'+d+'.length && node.collapsed" data-ng-click="'+a+'.selectNodeHead(node)"></i><i class="expanded" data-ng-show="node.'+d+'.length && !node.collapsed" data-ng-click="'+a+'.selectNodeHead(node)"></i><i class="normal" data-ng-hide="node.'+
d+'.length"></i> <span data-ng-class="node.selected" data-ng-click="'+a+'.selectNodeLabel(node)">{{node.'+e+'}}</span><div data-ng-hide="node.collapsed" data-tree-id="'+a+'" data-tree-model="node.'+d+'" data-node-id='+(c.nodeId||"id")+" data-node-label="+e+" data-node-children="+d+"></div></li></ul>";a&&g&&(c.angularTreeview&&(b[a]=b[a]||{},b[a].selectNodeHead=b[a].selectNodeHead||function(a){a.collapsed=!a.collapsed},b[a].selectNodeLabel=b[a].selectNodeLabel||function(c){b[a].currentNode&&b[a].currentNode.selected&&
(b[a].currentNode.selected=void 0);c.selected="selected";b[a].currentNode=c}),h.html('').append($compile(e)(b)))}}})})(angular);
