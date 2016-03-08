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

  var config;

  var user =
    {
      "uid":"",
      "dn":"",
      "attributes":
        [
          {"values":[""],"name":"uid"},

        ],
      "groups":[""]
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

    var workflows = {};
/*
    {
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
*/

    app.controller('ScaleController',['$compile', '$scope','$window','$http',function($compile, $scope, $window, $http){
      this.appIsError = false;
      this.sessionLoaded = false;
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
      this.userToSave = {};
      this.currentGroups;
      this.showModal = false;
      this.saveUserDisabled = false;
      this.requestAccessCurrentNode = this.orgs[0];
      this.requestAccessCurentWorkflows = this.workflows[this.requestAccessCurrentNode.id];
      this.modalTitle;
      this.modalMessage;
      this.saveUserErrors = [];
      this.saveUserSuccess = false;
      this.submitRequestsDisabled = false;

      this.rowNumber = 0;
      this.currentApproval = approvalDetails;

      //Initialize the attributes
      //for (var i in user.attributes) {
      //  this.attributes[user.attributes[i].name] = user.attributes[i].values[0];
      //}


      //Methods

      this.submitRequests = function() {
        this.submitRequestsDisabled = true;
        this.submitRequestsErrors = [];
        $scope.scale.submitRequestSuccess = [];
        this.modalMessage = "Submitting Requests...";
        this.showModal = true;

        wfRequests = [];

        for (wfname in this.cart) {
          wfrequest = {};
          wfrequest.name = wfname;
          wfrequest.reason = this.cart[wfname].reason;
          wfRequests.push(wfrequest);
        }

        $http.put("main/workflows",wfRequests).
          then(function(response) {
            $scope.scale.submitRequestsErrors = [];
            $scope.scale.submitRequestSuccess = [];

            for (wfname in  response.data) {
              if (response.data[wfname] === "success") {
                $scope.scale.submitRequestSuccess.push($scope.scale.cart[wfname].label);
                delete $scope.scale.cart[wfname];
              } else {
                msg = $scope.scale.cart[wfname].label + ' - ' + response.data[wfname];
                $scope.scale.submitRequestsErrors.push(msg);
              }
            }

            $scope.scale.showModal = false;
            $scope.scale.submitRequestsDisabled = false;
          },
          function(response) {
            $scope.scale.submitRequestsErrors = response.data.errors;
            $scope.scale.showModal = false;
            $scope.scale.submitRequestsDisabled = false;
          }
        )

      }

      this.loadSaveAttributes = function() {
        for (var i in this.user.attributes) {
          this.userToSave[this.user.attributes[i].name] = {
            name : this.user.attributes[i].name,
            value : this.user.attributes[i].values[0]
          };
        };
      } ;

      this.loadAttributes = function() {
        this.currentGroups = [];
        for (var i in this.user.attributes) {
          if (this.user.attributes[i].values.length > 0) {
            this.attributes[this.user.attributes[i].name] = this.user.attributes[i].values[0];
          }

          if (this.config.roleAttribute) {
            if (this.user.attributes[i].name === this.config.roleAttribute) {
              this.currentGroups = this.user.attributes[i].values;
            }
          }
        }

        if (! this.config.roleAttribute) {
          this.currentGroups = this.user.groups;
        }

        this.loadSaveAttributes();
      };

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
        this.loadWorkflowsErrors = [];

        $http.get('main/workflows/org/' + this.requestAccessCurrentNode.id).
          then(function(response) {
            $scope.scale.workflows[$scope.scale.requestAccessCurrentNode.id] = response.data;
            $scope.scale.requestAccessCurentWorkflows = $scope.scale.workflows[$scope.scale.requestAccessCurrentNode.id];
          },
          function(response) {
            $scope.scale.loadWorkflowsErrors = response.data.errors;
            $scope.scale.requestAccessCurentWorkflows = [];

          }
        );




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
          workflow.reason = "";
          delete this.cart[workflow.name];
        } else {
          workflow.inCart = true;
          this.cart[workflow.name] = workflow;
          this.cart[workflow.name].reason = "";
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

      this.isSessionLoaded = function() {
        return this.sessionLoaded;
      }

      this.setSessionLoadedComplete = function() {
        this.sessionLoaded = true;
      }

      this.toggleModal = function(){
          this.showModal = ! this.showModal;
      };

      this.saveUser = function() {
        this.saveUserDisabled = true;
        this.modalTitle = "Saving...";
        this.modalMessage = "Updating your account...";
        this.saveUserErrors = [];
        $scope.scale.saveUserSuccess = false;

        var payload = {};

        for (var attrName in this.userToSave) {
          if (! this.config.attributes[attrName].readOnly) {
            payload[attrName] = this.userToSave[attrName];
          }
        }


        $http.put('main/user',payload).
          then(function(response){
            $scope.scale.user = response.data;
            $scope.scale.loadAttributes();

            $scope.scale.saveUserSuccess = true;
            $scope.scale.saveUserDisabled = false;
            $scope.scale.showModal = false;

          },
          function(response) {
            $scope.scale.saveUserErrors = response.data.errors;
            $scope.scale.saveUserDisabled = false;
            $scope.scale.showModal = false;


          }
        );


        this.toggleModal();

      };

      angular.element(document).ready(function () {

        $http.get('main/config').
          then(function(response){
            $scope.scale.config = response.data;

            $http.get('main/user').
              then(function(response) {
                $scope.scale.user = response.data;
                $scope.scale.loadAttributes();

                $http.get('main/orgs').
                  then(function(response) {
                    $scope.scale.orgs = [response.data];
                    $scope.scale.setSessionLoadedComplete();
                    $scope.$apply();
                  },
                  function(response) {
                    $scope.scale.appIsError = true;
                    $scope.$apply();
                  }
                )


              },function(response){
                $scope.scale.appIsError = true;
                $scope.$apply();
              });
          },function(response){
            $scope.scale.appIsError = true;
            $scope.$apply();
          });




      });

    }







    ]);

    app.directive('modal', function () {
        return {
          template: '<div class="modal fade">' +
              '<div class="modal-dialog">' +
                '<div class="modal-content">' +
                  '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>' +
                    '<h4 class="modal-title">{{ title }}</h4>' +
                  '</div>' +
                  '<div class="modal-body" ng-transclude></div>' +
                '</div>' +
              '</div>' +
            '</div>',
          restrict: 'E',
          transclude: true,
          replace:true,
          scope:true,
          link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;

            scope.$watch(attrs.visible, function(value){
              if(value == true)
                $(element).modal('show');
              else
                $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function(){
              scope.$apply(function(){
                scope.$parent[attrs.visible] = true;
              });
            });

            $(element).on('hidden.bs.modal', function(){
              scope.$apply(function(){
                scope.$parent[attrs.visible] = false;
              });
            });
          }
        };
      });



})();




(function(f){f.module("angularTreeview",[]).directive("treeModel",function($compile){return{restrict:"A",link:function(b,h,c){var a=c.treeId,g=c.treeModel,e=c.nodeLabel||"label",d=c.nodeChildren||"children",e='<ul><li data-ng-repeat="node in '+g+'"><i class="collapsed" data-ng-show="node.'+d+'.length && node.collapsed" data-ng-click="'+a+'.selectNodeHead(node)"></i><i class="expanded" data-ng-show="node.'+d+'.length && !node.collapsed" data-ng-click="'+a+'.selectNodeHead(node)"></i><i class="normal" data-ng-hide="node.'+
d+'.length"></i> <span data-ng-class="node.selected" data-ng-click="'+a+'.selectNodeLabel(node)">{{node.'+e+'}}</span><div data-ng-hide="node.collapsed" data-tree-id="'+a+'" data-tree-model="node.'+d+'" data-node-id='+(c.nodeId||"id")+" data-node-label="+e+" data-node-children="+d+"></div></li></ul>";a&&g&&(c.angularTreeview&&(b[a]=b[a]||{},b[a].selectNodeHead=b[a].selectNodeHead||function(a){a.collapsed=!a.collapsed},b[a].selectNodeLabel=b[a].selectNodeLabel||function(c){b[a].currentNode&&b[a].currentNode.selected&&
(b[a].currentNode.selected=void 0);c.selected="selected";b[a].currentNode=c}),h.html('').append($compile(e)(b)))}}})})(angular);
