(function (module) {
    mifosX.controllers = _.extend(module, {
        NotificationsController: function (scope, rootScope, resourceFactory, location,
                                           notificationResponseHeaderFactory, localStorageService) {

            var objTypeUrlMap = {
                'client' : '/viewclient/',
                'group' : '/viewgroup/'
            };

            scope.notifications = [];
            scope.notificationsPerPage = 15;
            scope.isNotificationTrayOpen = false;
            scope.getResultsPage = function (pageNumber) {
                var items = resourceFactory.notificationsResource.getAllNotifications({
                    offset : ((pageNumber-1) * scope.notificationsPerPage),
                    limit: scope.notificationsPerPage
                }, function (data) {
                    scope.notifications = data.pageItems;
                });
            };
            scope.initNotificationTray = function() {
              var items = resourceFactory.notificationsResource.getAllUnreadNotifications({
                  offset: 0,
                  limit: scope.notificationsPerPage || 10
              }, function(data){
                  var readNotifications = localStorageService.getFromLocalStorage("notifications");
                  if (data.pageItems.length == 0) {
                      console.log("If was called");
                      if (readNotifications == null) {
                          scope.initPage();
                          console.log("There are no local storage notifications available.")
                      } else {
                          scope.notifications = readNotifications;
                          console.log("Fetching from local storage")
                      }
                  } else {
                      console.log("Else was called");
                      console.log(readNotifications);
                      if (readNotifications == null) {
                          scope.notifications = data.pageItems;
                          console.log("There are no local storage notifications available.")
                      } else {
                          scope.notifications = data.pageItems.concat
                          (readNotifications
                                  .slice(0, Math.abs(readNotifications.length - data.pageItems.length + 1)));
                          console.log(scope.notifications);
                          console.log("There are local storage notifications. Merging it with the new ones :)")
                      }
                      resourceFactory.notificationsResource.update();
                  }
                  localStorageService.removeFromLocalStorage("notifications");
                  localStorageService.addToLocalStorage("notifications", JSON.stringify(scope.notifications));
              })
            };
            scope.fetchItemsInTray = function () {
                if (scope.isNotificationTrayOpen) {
                    scope.initNotificationTray();
                }
            };
            scope.initPage = function () {
                var items = resourceFactory.notificationsResource.getAllNotifications({
                    offset: 0,
                    limit: scope.notificationsPerPage || 10
                }, function (data) {
                    scope.totalNotifications = data.totalFilteredRecords;
                    scope.notifications = data.pageItems;
                });
            };
            scope.initPage();
            scope.navigateToAction = function(notification){
                if(!notification.objectType || typeof(notification.objectType) !=='string'){
                    console.error('no object type found');
                    return;
                }
                notification.objectType = notification.objectType.toLowerCase();
                if(!objTypeUrlMap[notification.objectType] ){
                    console.error('objectType not found in map. Invalid object type');
                    return;

                }
                location.path(objTypeUrlMap[notification.objectType.toLowerCase()]+notification.objectId);
            };
        }
    });
    mifosX.ng.application.controller('NotificationsController', ['$scope', '$rootScope', 'ResourceFactory', '$location',
        'NotificationResponseHeaderFactory' , 'localStorageService', mifosX.controllers.NotificationsController])
        .run(function ($log, $rootScope) {
        $log.info("NotificationsController initialized");
        $rootScope.$on('eventFired', function(event, data) {

        });
    });
}(mifosX.controllers || {}));
