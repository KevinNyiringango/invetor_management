sap.ui.define([
    "sap/fe/test/JourneyRunner",
	"notif/notificationspanel/test/integration/pages/NotificationList",
	"notif/notificationspanel/test/integration/pages/NotificationObjectPage"
], function (JourneyRunner, NotificationList, NotificationObjectPage) {
    'use strict';

    var runner = new JourneyRunner({
        launchUrl: sap.ui.require.toUrl('notif/notificationspanel') + '/index.html',
        pages: {
			onTheNotificationList: NotificationList,
			onTheNotificationObjectPage: NotificationObjectPage
        },
        async: true
    });

    return runner;
});

