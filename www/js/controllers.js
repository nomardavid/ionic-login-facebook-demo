angular.module('controllers', [])

.controller('WelcomeCtrl', function($scope, $state, $q, UserFacebook, $ionicLoading) {

  var fbLoginSuccess = function(response) {
    if (!response.authResponse){
      fbLoginError("Cannot find the authResponse");
      return;
    }

    var authResponse = response.authResponse;

    getFacebookProfileInfo(authResponse)
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
      console.log('profile info fail', fail);
    });
  };


  var fbLoginError = function(error){
    console.log('fbLoginError', error);
    $ionicLoading.hide();
  };

  var getFacebookProfileInfo = function (authResponse) {
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
					getFacebookProfileInfo(success.authResponse)
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
          template: 'Iniciando Sesión...'
        });
        facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
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
			destructiveText: 'Cerrar sesión',
			titleText: '¿Estas seguro ?',
			cancelText: 'Cancelar',
			cancel: function() {},
			buttonClicked: function(index) {
				return true;
			},
			destructiveButtonClicked: function(){
				$ionicLoading.show({
					template: 'Cerrando Sesión...'
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
