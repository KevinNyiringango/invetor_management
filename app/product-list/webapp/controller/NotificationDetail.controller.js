sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "../model/formatter"
], function (Controller, History, MessageToast, formatter) {
    "use strict";

    return Controller.extend("productlist.controller.NotificationDetail", {
        formatter: formatter,

        onInit: function () {
            this.getRouter().getRoute("notificationDetail").attachPatternMatched(this._onPatternMatched, this);
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        _onPatternMatched: function (oEvent) {
            var sNotificationId = oEvent.getParameter("arguments").notificationId;
            this._loadNotification(sNotificationId);
        },

        _loadNotification: function (sNotificationId) {
            var that = this;
            // Fetch notification details
            fetch(`/odata/v4/notification/Notification(${sNotificationId})`, {
                headers: {
                    "Authorization": "Basic " + btoa(this._getCurrentUserName() + ":" + this._getCurrentUserName())
                }
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("Failed to fetch notification details");
                }
                return response.json();
            })
            .then(function(data) {
                var oModel = new sap.ui.model.json.JSONModel(data);
                that.getView().setModel(oModel, "notification");
            })
            .catch(function(error) {
                MessageToast.show(error.message);
            });
        },

        onNavBack: function () {
            var oHistory = History.getInstance();
            var sPreviousHash = oHistory.getPreviousHash();

            if (sPreviousHash !== undefined) {
                window.history.go(-1);
            } else {
                this.getRouter().navTo("main", {}, true);
            }
        },

        onMarkAsRead: function () {
            var oNotification = this.getView().getModel("notification").getData();
            var that = this;

            fetch("/odata/v4/notification/markAsRead", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + btoa(this._getCurrentUserName() + ":" + this._getCurrentUserName())
                },
                body: JSON.stringify({
                    notificationId: oNotification.ID
                })
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("Failed to mark notification as read");
                }
                return response.text().then(function(text) {
                    return text ? JSON.parse(text) : {};
                });
            })
            .then(function() {
                // Update the model to reflect the change
                that.getView().getModel("notification").setProperty("/isRead", true);
                MessageToast.show("Notification marked as read");
            })
            .catch(function(error) {
                MessageToast.show(error.message);
            });
        },

        _getCurrentUserName: function () {
            return this.getOwnerComponent().getCurrentUser();
        }
    });
});
