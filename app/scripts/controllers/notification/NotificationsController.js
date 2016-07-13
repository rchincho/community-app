(function (module) {
    mifosX.controllers = _.extend(module, {
        NotificationsController: function (scope, rootScope, resourceFactory, location, notificationResponseHeaderFactory) {

            var objTypeUrlMap = {
                'client' : '/viewclient/'
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
            scope.fetchItemsInTray = function () {
                if (scope.isNotificationTrayOpen) {
                    scope.initPage();
                }
            };
        }
    });
    mifosX.ng.application.controller('NotificationsController', ['$scope', '$rootScope', 'ResourceFactory', '$location',
        'NotificationResponseHeaderFactory' ,mifosX.controllers.NotificationsController]).run(function ($log, $rootScope) {
        $log.info("NotificationsController initialized");
        $rootScope.$on('eventFired', function(event, data) {

        });
    });
}(mifosX.controllers || {}));
