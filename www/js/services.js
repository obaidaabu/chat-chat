angular.module('services', [])
  .factory('ConfigurationService', function () {
    return {
      ServerUrl: function () {
       // return "https://chatad.herokuapp.com";
         // return "http://10.0.0.3:3000";
         return "http://192.168.1.14:3000";
      }
    }
  })
  .factory('UserService', function ($http, $log, $q, $cordovaFacebook, ConfigurationService) {
    return {

      CreateUser: function (user) {
        var deferred = $q.defer();
        
        $http.post(ConfigurationService.ServerUrl() + '/api/users',
          {
            "fbToken": user.fbToken,
            "notification_token" : user.notification_token
          }
          , {
            headers: {
              "Content-Type":"application/json"
            }
          }).success(function (data) {
            deferred.resolve(data);
          }).error(function (msg, code) {
            deferred.reject(msg);
            //   $log.error(msg, code);
          });
        return deferred.promise;
      },
      FBlogin: function () {
        var deferred = $q.defer();
        $cordovaFacebook.login(["public_profile", "email", "user_friends","user_birthday"]).then(
          function success(result) {
            
           
            window.localStorage['fbData'] = angular.toJson(result.authResponse);
            
              $cordovaFacebook.api("me/?fields=id,name,first_name,picture", ["public_profile"])
                .then(function(success) {
                  window.localStorage['fbName'] = success.name;
                  window.localStorage['fbFirstName'] = success.first_name;
                  window.localStorage['fbPicture'] = angular.toJson(success.picture);
                 
                  
                  deferred.resolve(success);
                  // success
                }, function (error) {
                  // error
                });
          },
          function error(reason) {
            
            loggedIn = false;
            deferred.reject("Failed to login to facebook");
          }
        );
        return deferred.promise;
      },      
    }
  })
  .factory('SubjectService', function ($http, $log, $q, ConfigurationService) {
    return {
      GetSubjects: function (userID) {
        var deferred = $q.defer();
        $http.get(ConfigurationService.ServerUrl() + '/api/subjects?_id='+userID , {
          headers: {

          }
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
          //   $log.error(msg, code);
        });
        return deferred.promise;
      },
      CreateSubject: function (subject) {
        var deferred = $q.defer();

        $http.post(ConfigurationService.ServerUrl() + '/api/subjects',
          {
            "title":subject.title,
            "user" : subject.user,
            "description": subject.description
          }
          , {
            headers: {
              "Content-Type":"application/json"
            }
          }).success(function (data) {
            deferred.resolve(data);
          }).error(function (msg, code) {
            deferred.reject(msg);
            //   $log.error(msg, code);
          });
        return deferred.promise;
      },
      DeleteSubjects: function (subject) {
        var deferred = $q.defer();
        $http.delete(ConfigurationService.ServerUrl() + '/api/subjects?_id='+ subject._id, {
          headers: {

          }
        }).success(function (data) {
          deferred.resolve(data);
        }).error(function (msg, code) {
          deferred.reject(msg);
          //   $log.error(msg, code);
        });
        return deferred.promise;
      }
    }
  })
  .factory('NotificationService', function ($http, $log, $q, ConfigurationService) {
    return {

      SendMessage: function (message) {
        var deferred = $q.defer();
        $http.post(ConfigurationService.ServerUrl() + '/api/notification',
          {
            "user": message.user,
            "message": message.message,
            "conversationId" : message.conversationId
          }
          , {
            headers: {
              "Content-Type":"application/json"
            }
          }).success(function (data) {
            deferred.resolve(data);
          }).error(function (msg, code) {
            deferred.reject(msg);
            //   $log.error(msg, code);
          });
        return deferred.promise;
      }
    }
  })
  .factory('EntityService', function () {
    var deleteFromArray = function(array,item){
      for(var i=0; i<array.length;i++){
        if(array[i]._id == item._id) {
          array.splice(i,1);
        }
      }
    };
    return {
      deleteFromArray : deleteFromArray

    };
  });
