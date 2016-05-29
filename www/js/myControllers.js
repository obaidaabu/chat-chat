angular.module('controllers', [])
  .controller('TabsCtrl', function ($scope, $ionicSideMenuDelegate) {

    $scope.openMenu = function () {
      $ionicSideMenuDelegate.toggleLeft();
    }

  })
  .controller('AppCtrl', function ($scope, $state) {

    $scope.addSubjectView = function () {
      $state.go('addSubject');
    }

  })
  .controller('addSubjectsCtrl', function ($scope, $rootScope, $state, $ionicHistory, SubjectService, EntityService) {
    $scope.create = function () {
      var subject = {
        title: $rootScope.subjectTitle,
        user: window.localStorage['userId'],
        description: $rootScope.subjectDesc
      }
      SubjectService.CreateSubject(subject)
        .then(function () {
          $state.go("tab.subjects");
        }, function (err) {
        });
    }
    $scope.GoBack = function () {
      // $state.go("tab.subjects");
      // $state.go("tab.subjects");
      $ionicHistory.goBack();
    }

  })
  .controller('ChatCtrl', function ($scope, $state, $firebaseArray,$firebaseObject,NotificationService) {
    $scope.conversationId = $state.params.conversationId;

    $scope.userId = window.localStorage['userId'];
    var createrId = $scope.conversationId.split("-")[0];
    var subjectId = $scope.conversationId.split("-")[1];
    //var createrUser = userRef.val(createrId);

    var myUrl = "https://chatoi.firebaseio.com/chats/" + window.localStorage['userId'] + "/" + $scope.conversationId;
    var ref = new Firebase(myUrl + "/messages");
    var list = $firebaseArray(ref);
    var isFirstMessage = false;
    //var unwatch = list.$watch(function () {
    list.$loaded()
      .then(function (x) {
        $scope.messages = x;
        if (x.length == 0) {
          isFirstMessage = true;
        }
      });


    //});
    $scope.sendMessage = function () {
      var otherUrl = "https://chatoi.firebaseio.com/chats/" + $scope.conversationId.split("-")[0] + "/" + window.localStorage['userId'] + '-' + $scope.conversationId.split("-")[1];
      var ref2, ref1;
      if (isFirstMessage) {
        ref2 = new Firebase(otherUrl);
        ref1 = new Firebase(myUrl);
        var newMessageRef1 = ref1.push();
        ref1.set({messages: [{body: $scope.messageContent, sender: window.localStorage['userId']}],userName:$state.params.userName,subjectName:$state.params.subjectName});
        var newMessageRef2 = ref2.push();
        ref2.set({messages: [{body: $scope.messageContent, sender: window.localStorage['userId']}],userName:window.localStorage['userName'],subjectName:$state.params.subjectName});
        isFirstMessage=false;
      }
      else {
        ref2 = new Firebase(otherUrl + "/messages");
        ref1 = new Firebase(myUrl + "/messages");
        var newMessageRef1 = ref1.push();
        newMessageRef1.set({body: $scope.messageContent, sender: window.localStorage['userId']});
        var newMessageRef2 = ref2.push();
        newMessageRef2.set({body: $scope.messageContent, sender: window.localStorage['userId']});
      }
      var userRef = new Firebase('https://chatoi.firebaseio.com/presence/'+createrId);
      userRef.on("value", function(userSnapshot) {
        if(userSnapshot.val() == 'offline'){

          var message = {
            user :createrId,
            message: $scope.messageContent,
            conversationId: window.localStorage['userId'] + "-" + subjectId
          }
          NotificationService.SendMessage(message)
            .then(function (message) {

            }, function (err) {
            });
        }
      });

      delete $scope.messageContent;
    }

  })

  .
  controller('LoginCtrl', function ($scope, $state, $ionicPlatform,$rootScope, UserService) {
    $scope.user = {
      userName:'',
      userPass:'',
      notification_token:''
    }

    $scope.fbLogin = function() {
      UserService.FBlogin().then(function success(s) {

        if(window.cordova && typeof window.plugins.OneSignal != 'undefined'){
          window.plugins.OneSignal.getIds(function (ids) {
            window.localStorage['notification_token'] = ids.userId;

          });
        }
        var fbData = angular.fromJson(window.localStorage['fbData']);     
       
        var user ={
          fbToken: fbData['accessToken'],
          notification_token: window.localStorage['notification_token']
        }
    
        UserService.CreateUser(user)
          .then(function (user) {
            alert("2");
            window.localStorage['userId'] = user._id;
             $state.go("tab.subjects");
          }, function (err) {
          });
        //alert($scope.FbName)

       
        
      }, function error(msg) {
        console.log("Error while performing Facebook login", msg);
      })
    };

    $scope.login = function () {
      $scope.user.notification_token = window.localStorage['notification_token'];
      UserService.CreateUser($scope.user)
        .then(function (user) {
          window.localStorage['userId'] = user._id;
          window.localStorage['userName']=user.name;
          $state.go("tab.subjects");
        }, function (err) {
        });


    }
  })
  .controller('SubjectsCtrl', function ($scope,$ionicPlatform, $rootScope, $state, $ionicHistory, SubjectService, EntityService,$firebaseArray) {


    var uuid = angular.fromJson(window.localStorage['uuid']);
    var userId = window.localStorage['userId']
    var amOnline = new Firebase('https://chatoi.firebaseio.com/.info/connected');
    var userRef = new Firebase('https://chatoi.firebaseio.com/presence/' + userId);

    amOnline.on('value', function(snapshot) {
      if (snapshot.val()) {

        userRef.onDisconnect().set('offline');
        userRef.set('online');
      }
    });
    //document.onIdle = function () {
    //  userRef.set('☆ idle');
    //}
    //document.onAway = function () {
    //  userRef.set('☄ away');
    //}
    //document.onBack = function (isIdle, isAway) {
    //  userRef.set('★ online');
    //}
    $scope.subjects = [];
    SubjectService.GetSubjects(userId)
      .then(function (subjects) {
        angular.copy(subjects, $scope.subjects);
      }, function (err) {
      });

    $scope.goToChat = function (subject) {
      $state.go('chat', {conversationId: subject.user._id + "-" + subject._id,userName:subject.user.userName,subjectName:subject.title})
    }
    $scope.deleteSubject = function (subject) {
      SubjectService.DeleteSubjects(subject)
        .then(function () {
          EntityService.deleteFromArray($scope.subjects, subject);
        }, function (err) {
        });
    }
  })
  .controller('MessagesCtrl', function ($scope,$rootScope, $firebaseArray, $state) {
    $scope.$on('$destroy', function() {
        console.log('destroy');
        unwatch();
    });

    var ref = new Firebase("https://chatoi.firebaseio.com/chats/" + window.localStorage['userId']);
    ref.on("child_added", function(snapshot) {
      var user = snapshot.val();


    });
    var list = $firebaseArray(ref)
    var unwatch = list.$watch(function () {

      list.$loaded()
        .then(function (x) {
          $scope.messages = [];
          $rootScope.rootChatCounter=$rootScope.rootChatCounter+1;
          angular.forEach(x, function (value, key) {

            var conversationId = value.$id;
            var messagesArray = Object.getOwnPropertyNames(value.messages);
            var lastMessageKey = messagesArray[messagesArray.length - 1];
            var lastMessage = value.messages[lastMessageKey].body;
            var createrId = conversationId.split("-")[0];
            var userRef = new Firebase('https://chatoi.firebaseio.com/presence/'+createrId);

            userRef.on("value", function(userSnapshot) {

              var online =true;
              if(userSnapshot.val() == 'offline'){
                online = false;

              }
            
               var indexx=indexOfConv($scope.messages,conversationId);
               if(indexx===-1) {
                 $scope.messages.push({
                   conversationId: conversationId, lastMessage: lastMessage,
                   subjectName: value.subjectName, userName: value.userName, online: online
                 });
               }
               else
               {
                 $scope.messages[indexx]=
                 {conversationId: conversationId, lastMessage: lastMessage,
                 subjectName: value.subjectName, userName: value.userName, online: online
               };
               }
              if(!$scope.$$phase) {
                $scope.$apply();
              }
             // $scope.$apply();
            });

          }, x);
        })
        .catch(function (error) {
          console.log("Error:", error);
        });
    });
function indexOfConv(arr,convId){
  for(var i=0;i<arr.length;i++)
  {
    if(arr[i].conversationId===convId)
    {
      return i=0;
    }
  }
  return -1;
}
    $scope.goToChat = function (conversationId) {
      $state.go('chat', {conversationId: conversationId})
    }
  });

