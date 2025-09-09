sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel"
], function (Controller, MessageToast, MessageBox, Filter, FilterOperator, JSONModel) {
    "use strict";

    return Controller.extend("productlist.controller.Main", {

        onInit: function () {
            // Initialize the smart table
            this._initializeSmartTable();
            
            // The notifications are now loaded by the Component
            // Just update the badge when the model is available
            var oNotificationModel = this.getView().getModel("notifications");
            if (oNotificationModel) {
                oNotificationModel.attachPropertyChange(this._updateNotificationBadge.bind(this));
                this._updateNotificationBadge();
            } else {
                // If model is not yet available, wait for it
                this.getView().attachModelContextChange(this._onModelContextChange.bind(this));
            }
        },

        _onModelContextChange: function() {
            var oNotificationModel = this.getView().getModel("notifications");
            if (oNotificationModel) {
                oNotificationModel.attachPropertyChange(this._updateNotificationBadge.bind(this));
                this._updateNotificationBadge();
            }
        },

        _initializeSmartTable: function () {
            var oSmartTable = this.byId("smartTable");
            
            if (oSmartTable) {
                // Set table properties
                oSmartTable.setUseExportToExcel(true);
                oSmartTable.setUseTablePersonalisation(true);
                oSmartTable.setUseVariantManagement(true);
                
                // Enable auto binding
                oSmartTable.attachInitialise(function() {
                    oSmartTable.rebindTable();
                });
            }
        },

        _updateNotificationBadge: function () {
            var oModel = this.getView().getModel("notifications");
            if (!oModel) return;
            
            var aNotifications = oModel.getProperty("/notifications");
            if (!aNotifications) return;
            
            var iUnreadCount = aNotifications.filter(function(notification) {
                return !notification.read;
            }).length;
            
            // Update the badge in the button's custom data
            var oButton = this.byId("notificationButton");
            if (oButton) {
                var aCustomData = oButton.getCustomData();
                if (aCustomData.length > 0) {
                    aCustomData[0].setValue(iUnreadCount.toString());
                }
                
                // Update tooltip to show count
                var sTooltip = iUnreadCount > 0 ? 
                    "Notifications (" + iUnreadCount + " unread)" : 
                    "Notifications";
                oButton.setTooltip(sTooltip);
            }
        },

        onNotificationPress: function (oEvent) {
            // Get the popover
            var oPopover = this.byId("notificationPopover");
            
            if (!oPopover) {
                // This shouldn't happen as popover is in the view
                MessageToast.show("Notification popup not available");
                return;
            }
            
            // Set the notification model to the popover
            oPopover.setModel(this.getView().getModel("notifications"), "notifications");
            
            // Open the popover
            oPopover.openBy(oEvent.getSource());
        },

        onNotificationItemPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext("notifications");
            var oNotification = oContext.getObject();
            
            // Mark as read
            if (!oNotification.isRead === false) {
                oNotification.isRead = true;
                var oModel = this.getView().getModel("notifications");
                oModel.refresh();
                this._updateNotificationBadge();
            }

            var sFormattedMessage = [
                "Title: " + oNotification.title,
                "\n\nDescription:\n" + oNotification.description,
                "\n\nPriority: " + oNotification.priority,
                "\nCreated: " + this.formatTimeAgo(oNotification.createdAt)
            ].join("");
            
            // Show detailed notification in MessageBox with custom styling
            MessageBox.show(sFormattedMessage, {
                icon: MessageBox.Icon.INFORMATION,
                title: "Notification Details",
                styleClass: "sapUiSizeCompact",
                actions: [MessageBox.Action.CLOSE],
                htmlText: false
            });
            
            // Close the popover
            this.byId("notificationPopover").close();
        },

        onMarkAllRead: function () {
            var oModel = this.getView().getModel("notifications");
            var aNotifications = oModel.getProperty("/notifications");
            
            // Mark all notifications as read
            aNotifications.forEach(function(notification) {
                notification.read = true;
            });
            
            oModel.refresh();
            this._updateNotificationBadge();
            MessageToast.show("All notifications marked as read");
        },

        onClearAllNotifications: function () {
            MessageBox.confirm("Are you sure you want to clear all notifications?", {
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oModel = this.getView().getModel("notifications");
                        oModel.setProperty("/notifications", []);
                        this._updateNotificationBadge();
                        MessageToast.show("All notifications cleared");
                        this.byId("notificationPopover").close();
                    }
                }.bind(this)
            });
        },

        onRefresh: function () {
            var oSmartTable = this.byId("smartTable");
            if (oSmartTable) {
                oSmartTable.rebindTable();
            }
            
            // Also refresh data from the component
            var oComponent = this.getOwnerComponent();
            if (oComponent && oComponent.refreshData) {
                oComponent.refreshData();
            }
            
            MessageToast.show("Data refreshed successfully!");
        },

        onItemPress: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oSelectedItem = oContext.getObject();
            
            MessageToast.show("Selected: " + oSelectedItem.Name);
            
            // Navigate to detail view or open dialog
            this._openProductDetail(oSelectedItem);
        },

        onAddProduct: function () {
            MessageToast.show("Add Product functionality - implement as needed");
            // Implement add product dialog/navigation
        },

        onEditProduct: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oProduct = oContext.getObject();
            
            MessageToast.show("Edit: " + oProduct.Name);
            // Implement edit functionality
        },

        onDeleteProduct: function (oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var oProduct = oContext.getObject();
            
            MessageBox.confirm(
                "Are you sure you want to delete '" + oProduct.Name + "'?",
                {
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.OK) {
                            this._deleteProduct(oProduct);
                        }
                    }.bind(this)
                }
            );
        },

        _deleteProduct: function (oProduct) {
            // Implement delete logic here
            MessageToast.show("Product deleted: " + oProduct.Name);
        },

        _openProductDetail: function (oProduct) {
            // Implement product detail view
            MessageToast.show("Opening details for: " + oProduct.Name);
        },

        // Formatter functions for enhanced display
        formatStockState: function (iQuantity, iMinStock) {
            if (!iQuantity || !iMinStock) return "None";
            
            var fQuantity = parseInt(iQuantity);
            var fMinStock = parseInt(iMinStock);
            
            if (fQuantity <= 0) {
                return "Error"; // Out of stock - red
            } else if (fQuantity <= fMinStock) {
                return "Warning"; // Low stock - orange
            } else if (fQuantity <= fMinStock * 2) {
                return "Information"; // Medium stock - blue
            } else {
                return "Success"; // Good stock - green
            }
        },

        calculateStockPercentage: function (iQuantity, iMinStock) {
            if (!iQuantity || !iMinStock) return 0;
            
            var fQuantity = parseInt(iQuantity);
            var fMinStock = parseInt(iMinStock);
            
            // Calculate percentage based on minimum stock level
            var fPercentage = (fQuantity / (fMinStock * 3)) * 100; // Assuming 3x min stock is 100%
            return Math.min(fPercentage, 100);
        },

        formatTimeAgo: function (sDate) {
            if (!sDate) return "";
            
            var oDate = new Date(sDate);
            var oNow = new Date();
            var iDaysDiff = Math.floor((oNow - oDate) / (1000 * 60 * 60 * 24));
            
            if (iDaysDiff === 0) {
                return "Today";
            } else if (iDaysDiff === 1) {
                return "Yesterday";
            } else if (iDaysDiff < 7) {
                return iDaysDiff + " days ago";
            } else if (iDaysDiff < 30) {
                var iWeeks = Math.floor(iDaysDiff / 7);
                return iWeeks + (iWeeks === 1 ? " week ago" : " weeks ago");
            } else {
                var iMonths = Math.floor(iDaysDiff / 30);
                return iMonths + (iMonths === 1 ? " month ago" : " months ago");
            }
        }
    });
});