sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("productlist.Component", {
        
        init: function() {
            // Call parent init
            UIComponent.prototype.init.apply(this, arguments);
            console.log("Component initialized");
            
            // Set up the data model
            this.setupDataModel();
            
            // Start notification polling
            this._startNotificationPolling();
            
            // Create and display the main view
            this.createMainView();
        },

        _startNotificationPolling: function() {
            var that = this;
            // Poll for new notifications every 5 seconds
            this._notificationPollInterval = setInterval(function() {
                that.loadNotificationData();
            }, 5000);
        },

        exit: function() {
            if (this._notificationPollInterval) {
                clearInterval(this._notificationPollInterval);
            }
        },

        setupDataModel: function() {
            // Create JSON model for products
            var oModel = new JSONModel();
            this.setModel(oModel);
            
            // Create JSON model for notifications
            var oNotificationModel = new JSONModel();
            this.setModel(oNotificationModel, "notifications");
            
            // Load both products and notifications
            this.loadData();
        },

        loadData: function() {
            // Load products and notifications in parallel
            Promise.all([
                this.loadProductData(),
                this.loadNotificationData()
            ]).then(function(results) {
                console.log("All data loaded successfully");
            }).catch(function(error) {
                console.error("Error loading data:", error);
            });
        },

        loadProductData: function() {
            var oModel = this.getModel();
            var that = this;
            
            console.log("Loading product data from CAP service...");
            
            return fetch("/odata/v4/inventory/Product")
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + " - " + response.statusText);
                    }
                    return response.json();
                })
                .then(function(data) {
                    console.log("Product data loaded successfully:", data);
                    
                    // Set the data to the model
                    oModel.setData({
                        Product: data.value || []
                    });
                    
                    console.log("Product model updated with", data.value ? data.value.length : 0, "products");
                })
                .catch(function(error) {
                    console.error("Error loading product data:", error);
                    
                    // Set empty data on error
                    oModel.setData({
                        Product: []
                    });
                    
                    // Show error message
                    sap.m.MessageToast.show("Error loading product data: " + error.message);
                    throw error; // Re-throw to be caught by Promise.all
                });
        },

        loadNotificationData: function() {
            var oNotificationModel = this.getModel("notifications");
            var that = this;
            
            console.log("Loading notification data from CAP service...");
            
            return fetch("/odata/v4/inventory/Notification")
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + " - " + response.statusText);
                    }
                    return response.json();
                })
                .then(function(data) {
                    console.log("Notification data loaded successfully:", data);
                    
                    // Set the data to the notification model
                    var notifications = data.value || [];
                    oNotificationModel.setData({
                        notifications: notifications
                    });
                    
                    // Fire model change event
                    oNotificationModel.firePropertyChange({
                        reason: "Change",
                        path: "/notifications",
                        value: notifications
                    });
                    
                    console.log("Notification model updated with", notifications.length, "notifications");
                })
                .catch(function(error) {
                    console.error("Error loading notification data:", error);
                    
                    // Set empty data on error
                    oNotificationModel.setData({
                        notifications: []
                    });
                    
                    console.log("Error loading notifications, using empty array:", error.message);
                });
        },

        createMainView: function() {
            var that = this;
            
            // Create the main view
            sap.ui.require([
                "sap/ui/core/mvc/XMLView"
            ], function(XMLView) {
                XMLView.create({
                    id: "mainView",
                    viewName: "productlist.view.Main"
                }).then(function(oView) {
                    // Set both models to the view
                    oView.setModel(that.getModel());
                    oView.setModel(that.getModel("notifications"), "notifications");
                    
                    // Place the view in a container
                    oView.placeAt("content");
                });
            });
        },

        // Utility method to refresh data
        refreshData: function() {
            this.loadData();
        },

        // Method to get fresh product data
        refreshProductData: function() {
            return this.loadProductData();
        },

        // Method to get fresh notification data
        refreshNotificationData: function() {
            return this.loadNotificationData();
        }
    });
});