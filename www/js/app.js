(function () {
  var app = angular.module('starter', ['ionic', 'controllers', 'services', 'directives','firebase', 'ngCordova']);

  app.run(function ($ionicPlatform,$rootScope , $state) {

    $rootScope.rootChatCounter = 0;
    $ionicPlatform.on('pause', function() {
      Firebase.goOffline();

    });
    $ionicPlatform.on('resume', function() {
      Firebase.goOnline();

    });
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins.Keyboard) {

        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);


        cordova.plugins.Keyboard.disableScroll(true);
      }
      if(window.cordova && typeof window.plugins.OneSignal != 'undefined'){
        var notificationOpenedCallback = function (jsonData) {

          var conversationId = jsonData.additionalData.conversationId;

          $state.go("chat",{conversationId: conversationId});

        };
        window.plugins.OneSignal.init("ee6f85c1-a2ff-4d1b-9fa6-29dd4cc306ef",
          { googleProjectNumber: "238478083352" },
          notificationOpenedCallback);
        window.plugins.OneSignal.enableNotificationsWhenActive(false);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
      // if(!window.localStorage['userId']){
      //   window.localStorage['userId'] = "574df1a6064a6445864bca43";
      // }
      window.localStorage.clear();
      if(!window.localStorage['userId']){
        window.localStorage['userId'] = "574df1a6064a6445864bca43";
        window.localStorage['userName'] = "aa";
      }
      var uuid = window.localStorage['userId'];

     
      if (uuid && uuid != 'undefined') {

        $state.go("tab.subjects");
      }
      else {
        $state.go("login");
      }
    });
  })
    .config(function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
      //$ionicConfigProvider.views.maxCache(0);

      $stateProvider.state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: "LoginCtrl"
      })

        .state('chat', {
          url: '/chat/:conversationId/:lastMessageKey/:userName/:subjectName',
          templateUrl: 'templates/chat.html',
          controller: "ChatCtrl"
        })
        .state('addSubject', {
          url: '/addSubject',
          templateUrl: 'templates/add-subject.html',
          controller: "addSubjectsCtrl"
        })

        //$stateProvider.state('messages', {
        //  url: '/messages',
        //  templateUrl: 'templates/messages.html',
        //  controller:"MessagesCtrl"
        //});
        .state('tab', {
          url: '/tab',
          templateUrl: 'templates/tabs.html',
          controller: "TabsCtrl"
        })
        .state('tab.subjects', {
          url: '/subjects',
          views: {
            'subjects-page': {
              templateUrl: 'templates/subjects.html',
              controller: "SubjectsCtrl"
            }
          }
        })
        .state('tab.messages', {
          url: '/messages',
          views: {
            'messages-page': {
              templateUrl: 'templates/messages.html',
              controller: "MessagesCtrl"
            }
          }
        });
    })
}());
// All this does is allow the message
// to be sent when you tap return




