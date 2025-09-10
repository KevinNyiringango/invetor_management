sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function(UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("productlist.Component", {
        
        init: function() {
            // Call parent init
            UIComponent.prototype.init.apply(this, arguments);
            
            // Set up the data model
            this.setupDataModel();
            
            // Set up user role model
            this.setupUserModel();
            
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

        setupUserModel: function() {
            // Create user model with default values
            var oUserModel = new JSONModel({
                isAdmin: false,
                role: "user",
                username: "",
                permissions: []
            });
            this.setModel(oUserModel, "user");
            
            // Load user role
            // this.loadUserRole();
        },

        // loadUserRole: function() {
        //     var that = this;
        //     var oUserModel = this.getModel("user");
            
        //     console.log("Loading user role from CAP authentication...");
            
        //     return this._fetchUserFromCAP()
        //         .then(function(userInfo) {
        //             var isAdmin = userInfo.roles && userInfo.roles.includes('Admin');
                    
        //             // Update user model
        //             oUserModel.setData({
        //                 isAdmin: isAdmin,
        //                 role: isAdmin ? "Admin" : "User",
        //                 userName: userInfo.user || "Unknown",
        //                 permissions: isAdmin ? ["create", "read", "update", "delete"] : ["read"]
        //             });
                    
        //             console.log("User role loaded:", isAdmin ? "Admin" : "User", "for user:", userInfo.user);
        //             return isAdmin;
        //         })
        //         .catch(function(error) {
        //             console.error("Error loading user role:", error);
                    
        //             // Fallback: Check URL parameter for testing with your CAP users
        //             var urlParams = new URLSearchParams(window.location.search);
        //             var user = urlParams.get('user');
        //             var isAdmin = false;
        //             var userName = "Unknown";
                    
        //             if (user === 'alice') {
        //                 isAdmin = true;
        //                 userName = 'alice';
        //             } else if (user === 'bob') {
        //                 isAdmin = false;
        //                 userName = 'bob';
        //             } else {
        //                 // Default for testing
        //                 isAdmin = window.location.hostname === 'localhost';
        //                 userName = isAdmin ? 'alice' : 'bob';
        //             }
                    
        //             // Update user model with fallback data
        //             oUserModel.setData({
        //                 isAdmin: isAdmin,
        //                 role: isAdmin ? "Admin" : "User",
        //                 userName: userName,
        //                 permissions: isAdmin ? ["create", "read", "update", "delete"] : ["read"]
        //             });
                    
        //             console.log("Using fallback user role:", isAdmin ? "Admin" : "User", "for user:", userName);
        //             return Promise.resolve(isAdmin);
        //         });
        // },

        // _fetchUserFromCAP: function() {
        //     // Try to get user info from CAP service
        //     return fetch("/user-info")
        //         .then(function(response) {
        //             if (response.ok) {
        //                 return response.json();
        //             }
        //             throw new Error("User info not available");
        //         })
        //         .catch(function(error) {
        //             // Fallback for testing - simulate CAP user based on URL parameter
        //             var urlParams = new URLSearchParams(window.location.search);
        //             var user = urlParams.get('user');
                    
        //             if (user === 'alice') {
        //                 return Promise.resolve({ 
        //                     user: 'alice', 
        //                     roles: ['Admin'] 
        //                 });
        //             } else if (user === 'bob') {
        //                 return Promise.resolve({ 
        //                     user: 'bob', 
        //                     roles: ['User'] 
        //                 });
        //             }
                    
        //             // Default behavior for testing
        //             var defaultUser = window.location.hostname === 'localhost' ? 'alice' : 'bob';
        //             var defaultRoles = defaultUser === 'alice' ? ['Admin'] : ['User'];
                    
        //             return Promise.resolve({ 
        //                 user: defaultUser, 
        //                 roles: defaultRoles 
        //             });
        //         });
        // },

        loadData: function() {
            // Load products and notifications in parallel
            Promise.all([
                this.loadProductData(),
                this.loadNotificationData()
            ]).then(function(results) {
            }).catch(function(error) {
                console.error("Error loading data:", error);
            });
        },

        loadProductData: function() {
            var oModel = this.getModel();
            var that = this;
            
            
            return fetch("/odata/v4/inventory/Product")
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + " - " + response.statusText);
                    }
                    return response.json();
                })
                .then(function(data) {
                    
                    // Handle nested structure
                    var products = data.value[0]?.value || [];
                    var userRole = data.value[0]?.userRole || "User";
                    
                    // Set the product data
                    oModel.setData({
                        Product: products
                    });

                    // Update user model with role from backend
                    var oUserModel = that.getModel("user");
                    if (oUserModel) {
                        oUserModel.setData({
                            isAdmin: userRole === "Admin",
                            role: userRole,
                            userName: userRole === "Admin" ? "alice" : "bob",
                            permissions: userRole === "Admin" ? ["create", "read", "update", "delete"] : ["read"]
                        });
                    }

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
            
            
            return fetch("/odata/v4/inventory/Notification")
                .then(function(response) {
                    if (!response.ok) {
                        throw new Error("HTTP " + response.status + " - " + response.statusText);
                    }
                    return response.json();
                })
                .then(function(data) {
                    
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
                    // Set all models to the view
                    oView.setModel(that.getModel());
                    oView.setModel(that.getModel("notifications"), "notifications");
                    oView.setModel(that.getModel("user"), "user");
                    
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
        },

        // Method to check user permissions
        hasPermission: function(permission) {
            var oUserModel = this.getModel("user");
            var aPermissions = oUserModel.getProperty("/permissions") || [];
            return aPermissions.includes(permission);
        },

        // Method to get current user info
        getCurrentUser: function() {
            var oUserModel = this.getModel("user");
            return oUserModel.getData();
        }
    });
});