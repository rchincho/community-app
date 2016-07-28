(function (module) {
    mifosX.controllers = _.extend(module, {
        NotificationsController: function (scope, rootScope, resourceFactory, location, timeout,
                                           notificationResponseHeaderFactory, localStorageService) {

            var objTypeUrlMap = {
                'client' : '/viewclient/',
                'group' : '/viewgroup/'
            };
            scope.notifications = [];
            scope.notificationsPerPage = 15;
            scope.isNotificationTrayOpen = false;
            scope.isNotificationIconRed = false;
            scope.numberOfUnreadNotifications = 0;
            scope.counter = 0;
            scope.initNotificationTray = function() {
                var readNotifications = localStorageService.getFromLocalStorage("notifications");
                if (readNotifications == null) {
                    scope.initNotificationsPage();
                    console.log("Fetching Notifications from the server");
                } else {
                    scope.notifications = readNotifications;
                    console.log("Fetching notifications from the local database.");
                }

                if (scope.numberOfUnreadNotifications > 0 ) {
                    resourceFactory.notificationsResource.update();
                    scope.numberOfUnreadNotifications = 0;
                }
            };
            scope.initNotificationsPage = function () {
                var items = resourceFactory.notificationsResource.getAllNotifications({
                    offset: 0,
                    limit: scope.notificationsPerPage || 10
                }, function (data) {
                    scope.totalNotifications = data.totalFilteredRecords;
                    scope.notifications = data.pageItems;
                    localStorageService.addToLocalStorage("notifications", JSON.stringify(scope.notifications));
                });
            };
            scope.getResultsPage = function (pageNumber) {
                var items = resourceFactory.notificationsResource.getAllNotifications({
                    offset : ((pageNumber-1) * scope.notificationsPerPage),
                    limit: scope.notificationsPerPage
                }, function (data) {
                    scope.notifications = data.pageItems;
                });
            };
            scope.fetchUnreadNotifications = function() {
                var items = resourceFactory.notificationsResource.getAllUnreadNotifications({
                    offset: 0,
                    limit: scope.notificationsPerPage || 10
                }, function(data) {
                    scope.numberOfUnreadNotifications = data.pageItems.length;
                    console.log("Number of unread notifications are : " + scope.numberOfUnreadNotifications);
                    scope.counter = 0;
                    var readNotifications = localStorageService.getFromLocalStorage("notifications");
                    if (readNotifications == null) {
                        scope.initNotificationsPage();
                    } else {
                        for (j = 0; j < data.pageItems.length; j++) {
                            for (i = 0; i < readNotifications.length; i++) {
                                if (JSON.stringify(readNotifications[i]) === JSON.stringify(data.pageItems[j])) {
                                    readNotifications.splice(i, 1);
                                }
                            }
                        }
                        scope.notifications = data.pageItems.concat
                        (readNotifications
                            .slice(0, Math.abs(readNotifications.length - data.pageItems.length + 1)));
                        console.log("There are local storage notifications. Merging it with the new ones :)")
                    }
                    localStorageService.addToLocalStorage("notifications", JSON.stringify(scope.notifications));
                });
             };
            scope.fetchUnreadNotifications();
            scope.navigateToAction = function(notification) {
                if(!notification.objectType || typeof(notification.objectType) !=='string'){
                    console.error('no object type found');
                    return;
                }
                notification.objectType = notification.objectType.toLowerCase();
                if(!objTypeUrlMap[notification.objectType] ){
                    console.error('objectType not found in map. Invalid object type');
                    return;
                }
                location.path(objTypeUrlMap[notification.objectType.toLowerCase()] + notification.objectId);
            };
            scope.countFromLastResponse = function() {
                scope.counter++;
                if (scope.counter === 60) {
                    scope.counter = 0;
                    scope.fetchUnreadNotifications();
                }
                timeout(scope.countFromLastResponse, 1000);
            };
            scope.fetchItemsInNotificationTray = function() {
              if (scope.isNotificationTrayOpen) {
                  scope.initNotificationTray();
              } 
            };
            scope.$on('eventFired', function(event, data) {
                scope.counter = 0;
                if (data.notificationStatus === "true") {
                    scope.fetchUnreadNotifications();
                }
            });
            rootScope.$broadcast
        }
    });
    mifosX.ng.application.controller('NotificationsController', ['$scope', '$rootScope', 'ResourceFactory', '$location',
        '$timeout', 'NotificationResponseHeaderFactory' , 'localStorageService', mifosX.controllers.NotificationsController])
        .run(function ($log) {
        $log.info("NotificationsController initialized");
    });
}(mifosX.controllers || {}));

