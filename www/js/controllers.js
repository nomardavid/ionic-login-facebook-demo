angular.module('controllers', [])

.controller('WelcomeCtrl', function($scope, $state, $q, UserFacebook, $ionicLoading) {

  var loginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Auth Error");
      return;
    }

    var authResponse = response.authResponse;

    getProfileInfo(authResponse)
    .then(function(profileInfo) {
      UserFacebook.setUser({
        authResponse: authResponse,
				userID: profileInfo.id,
				name: profileInfo.name,
				email: profileInfo.email,
        picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
      });

      $ionicLoading.hide();
      $state.go('app.home');

    }, function(fail){
      console.log('profile get info fail', fail);
    });
  };


  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  var getProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
      function (response) {
				console.log(response);
        info.resolve(response);
      },
      function (response) {
				console.log(response);
        info.reject(response);
      }
    );
    return info.promise;
  };

  $scope.loginFB = function() {

    facebookConnectPlugin.getLoginStatus(function(success){
     if(success.status === 'connected'){

        console.log('getLoginStatus', success.status);

				var user = UserFacebook.getUser('facebook');

				if(!user.userID)
				{
					getProfileInfo(success.authResponse)
					.then(function(profileInfo) {

						UserFacebook.setUser({
							authResponse: success.authResponse,
							userID: profileInfo.id,
							name: profileInfo.name,
							email: profileInfo.email,
							picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
						});

						$state.go('app.home');

					}, function(fail){
						console.log('profile info fail', fail);
					});
				}else{
					$state.go('app.home');
				}

     } else {

        console.log('getLoginStatus', success.status);

			  $ionicLoading.show({
          template: 'Loging...'
        });
        facebookConnectPlugin.login(['email', 'public_profile'], loginSuccess, fbLoginError);
      }
    });
  };
})



.controller('AppCtrl', function($scope){

})

.controller('HomeCtrl', function($scope, UserFacebook, $ionicActionSheet, $state, $ionicLoading){

	$scope.user = UserFacebook.getUser();

	$scope.showLogOutMenu = function() {
		var hideSheet = $ionicActionSheet.show({
			destructiveText: 'Log Out',
			titleText: 'Are you sure ?',
			cancelText: 'Cancel',
			cancel: function() {},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked: function(){
				$ionicLoading.show({
					template: 'Close Session...'
				});

        //facebook logout
        facebookConnectPlugin.logout(function(){
          $ionicLoading.hide();
          $state.go('welcome');
        },
        function(fail){
          $ionicLoading.hide();
        });
			}
		});
	};
})

;
