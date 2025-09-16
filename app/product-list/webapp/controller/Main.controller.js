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
            
            // Initialize user role management
            this._initializeUserRole();
            
            // Start notification polling
            this._startNotificationPolling();
            
            // Initial notification setup
            var oNotificationModel = this.getView().getModel("notifications");
            if (oNotificationModel) {
                oNotificationModel.attachPropertyChange(this._updateNotificationBadge.bind(this));
                this._updateNotificationBadge();
            } else {
                this.getView().attachModelContextChange(this._onModelContextChange.bind(this));
            }
        },

        _initializeUserRole: function() {
            // Create user role model
            var oUserModel = new JSONModel({
                isAdmin: false,
                role: "bob" // Default role
            });
            this.getView().setModel(oUserModel, "user");
            
            // Load user role from backend or determine it
            this._loadUserRole();
        },

        _loadUserRole: function() {
            var oUserModel = this.getView().getModel("user");
            var userName = this._getCurrentUserName();
            var isAdmin = this._determineUserRole();
            
            oUserModel.setProperty("/isAdmin", isAdmin);
            oUserModel.setProperty("/role", isAdmin ? "Admin" : "User");
            oUserModel.setProperty("/userName", userName);
        },

        _getCurrentUserName: function() {
            // Get current user name from URL parameter (for testing) or other source
            var urlParams = new URLSearchParams(window.location.search);
            var user = urlParams.get('user');
            
            if (user === 'alice' || user === 'bob') {
                return user;
            }
            
            // Default based on hostname for testing
            return window.location.hostname === 'localhost' ? 'alice' : 'bob';
        },

        _determineUserRole: function() {
            // Replace this with your actual role determination logic
            // This could be based on:
            // 1. JWT token claims
            // 2. Backend API call
            // 3. User session data
            // 4. URL parameters (for demo)
            
            // For demo purposes, check URL parameter or default to admin for testing
            var urlParams = new URLSearchParams(window.location.search);
            var role = urlParams.get('role');
            
            if (role === 'admin') {
                return true;
            } else if (role === 'user') {
                return false;
            }
            
            // Default behavior - you might want to change this
            // For demo, we'll make it admin if localhost, otherwise user
            return window.location.hostname === 'localhost';
        },

        _onModelContextChange: function() {
            var oNotificationModel = this.getView().getModel("notifications");
            if (oNotificationModel) {
                oNotificationModel.attachPropertyChange(this._updateNotificationBadge.bind(this));
                this._updateNotificationBadge();
            }
        },

        _startNotificationPolling: function() {
            // Poll every 30 seconds
            this._pollInterval = setInterval(function() {
                this._refreshNotifications();
            }.bind(this), 30000); // 30 seconds
        },

        _refreshNotifications: function() {
            var oComponent = this.getOwnerComponent();
            if (oComponent && oComponent.loadNotificationData) {
                oComponent.loadNotificationData().then(function() {
                    this._updateNotificationBadge();
                }.bind(this));
            }
        },

        onExit: function() {
            // Clear polling interval when view is destroyed
            if (this._pollInterval) {
                clearInterval(this._pollInterval);
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
            
            // Count total notifications
            var iTotalCount = aNotifications.length;
            
            // Update the notification count on the button
            var oButton = this.byId("notificationButton");
            if (oButton) {
                // Always show total count
                oButton.setText(iTotalCount > 0 ? iTotalCount.toString() : "");
                
                // Update tooltip to show count
                var sTooltip = iTotalCount > 0 ? 
                    "Notifications (" + iTotalCount + ")" : 
                    "No Notifications";
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
            var that = this;

            // Show notification details with mark as read button
            var sFormattedMessage = [
                "Title: " + oNotification.title,
                "\n\nDescription:\n" + oNotification.description,
                "\n\nPriority: " + oNotification.priority,
                "\nCreated: " + that.formatTimeAgo(oNotification.createdAt)
            ].join("");
            
            MessageBox.show(sFormattedMessage, {
                icon: MessageBox.Icon.INFORMATION,
                title: "Notification Details",
                styleClass: "sapUiSizeCompact",
                actions: oNotification.isRead ? 
                    [MessageBox.Action.CLOSE] : 
                    [MessageBox.Action.OK, MessageBox.Action.CLOSE],
                emphasizedAction: MessageBox.Action.OK,
                initialFocus: MessageBox.Action.OK,
                buttonText: {
                    [MessageBox.Action.OK]: "Mark as Read"
                },
                onClose: function(oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        // Mark as read in backend
                        fetch("/odata/v4/notification/markAsRead", {
                            method: "POST",
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": "Basic " + btoa(that._getCurrentUserName() + ":" + that._getCurrentUserName())
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
                        .then(function(data) {
                            // Refresh notifications to update UI
                            that._refreshNotifications();
                            MessageToast.show("Notification marked as read");
                        })
                        .catch(function(error) {
                            MessageBox.error("Error: " + error.message);
                        });
                    }
                }
            });

            // Close the popover
            this.byId("notificationPopover").close();
        },

        onMarkAllRead: function () {
            var that = this;
            
            fetch("/odata/v4/notification/markAllAsRead", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + btoa(this._getCurrentUserName() + ":" + this._getCurrentUserName())
                }
            })
            .then(function(response) {
                if (!response.ok) {
                    throw new Error("Failed to mark notifications as read");
                }
                return response.text().then(function(text) {
                    return text ? JSON.parse(text) : {};
                });
            })
            .then(function(data) {
                // Refresh notifications after marking as read
                that._refreshNotifications();
                MessageToast.show(data.message || "All notifications marked as read");
            })
            .catch(function(error) {
                MessageBox.error("Error: " + error.message);
            });
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
            var oUserModel = this.getView().getModel("user");
            var oContext = oEvent.getSource().getBindingContext();
            var oSelectedItem = oContext.getObject();
            
            // if (!oUserModel.getProperty("/isAdmin")) {
            //     return;
            // }
            
            // Navigate to detail view or open dialog for admins
            this._openProductDetail(oSelectedItem);
        },

        // Admin-only CRUD operations
        onAddProduct: function () {
            var oUserModel = this.getView().getModel("user");
            if (!oUserModel.getProperty("/isAdmin")) {
                MessageToast.show("Access denied: Admin privileges required");
                return;
            }
            
            MessageToast.show("Add Product functionality - implement as needed");
            // Implement add product dialog/navigation
            this._openAddProductDialog();
        },

        onEditProduct: function (oEvent) {
            var oUserModel = this.getView().getModel("user");
            if (!oUserModel.getProperty("/isAdmin")) {
                MessageToast.show("Access denied: Admin privileges required");
                return;
            }
            
            // Get the binding context from the selected item
            var oButton = oEvent.getSource();
            var oBindingContext = oButton.getBindingContext();
            
            if (!oBindingContext) {
                MessageToast.show("Error: Could not get product details");
                return;
            }
            
            var oProduct = oBindingContext.getObject();
            this._openEditProductDialog(oProduct);
        },

        onDeleteProduct: function (oEvent) {
            var oUserModel = this.getView().getModel("user");
            if (!oUserModel.getProperty("/isAdmin")) {
                MessageToast.show("Access denied: Admin privileges required");
                return;
            }
            
            var oContext = oEvent.getSource().getBindingContext();
            var oProduct = oContext.getObject();
            
            MessageBox.confirm(
                "Are you sure you want to delete '" + oProduct.Name + "'?",
                {
                    icon: MessageBox.Icon.WARNING,
                    title: "Delete Product",
                    actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.DELETE,
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.DELETE) {
                            this._deleteProduct(oProduct);
                        }
                    }.bind(this),
                    styleClass: "sapUiSizeCompact"
                }
            );
        },

        _deleteProduct: function (oProduct) {
            // Implement actual delete logic here
            var that = this;
            
            // Simulate API call to delete product
            // Replace with actual backend call
            MessageToast.show("Deleting product: " + oProduct.Name);
            
            // After successful deletion, refresh the table
            setTimeout(function() {
                that.onRefresh();
                MessageToast.show("Product deleted successfully: " + oProduct.Name);
            }, 1000);
        },

        _openProductDetail: function (oProduct) {
            // Implement product detail view
            return;
        },

        _openAddProductDialog: function() {
            if (!this._oProductDialog) {
                this._oProductDialog = sap.ui.xmlfragment(
                    "productlist.view.fragments.ProductDialog",
                    this
                );
                this.getView().addDependent(this._oProductDialog);
            }

            // Initialize dialog model
            var oDialogModel = new JSONModel({
                title: "Create New Product",
                isEdit: false,
                product: {
                    Name: "",
                    Description: "",
                    Category: "",
                    UnitPrice: 0,
                    Quantity: 0,
                    MinimumStockLevel: 0
                }
            });
            
            this._oProductDialog.setModel(oDialogModel, "dialog");
            this._oProductDialog.open();
        },

        _openEditProductDialog: function(oProduct) {
            var oUserModel = this.getView().getModel("user");
            if (!oUserModel.getProperty("/isAdmin")) {
                MessageToast.show("Access denied: Admin privileges required");
                return;
            }

            if (!this._oProductDialog) {
                this._oProductDialog = sap.ui.xmlfragment(
                    "productlist.view.fragments.ProductDialog",
                    this
                );
                this.getView().addDependent(this._oProductDialog);
            }

            // Initialize dialog model with existing product data
            var oDialogModel = new JSONModel({
                title: "Edit Product",
                isEdit: true,
                product: Object.assign({}, oProduct)
            });
            
            this._oProductDialog.setModel(oDialogModel, "dialog");
            this._oProductDialog.open();
        },

        onSaveProduct: function() {
            var oUserModel = this.getView().getModel("user");
            if (!oUserModel.getProperty("/isAdmin")) {
                MessageToast.show("Access denied: Admin privileges required");
                return;
            }

            var oDialog = this._oProductDialog;
            var oDialogModel = oDialog.getModel("dialog");
            var oProduct = oDialogModel.getProperty("/product");
            var bIsEdit = oDialogModel.getProperty("/isEdit");
            
            if (!this._validateProductData(oProduct)) {
                MessageToast.show("Please fill in all required fields");
                return;
            }

            if (bIsEdit) {
                this._updateProduct(oProduct);
            } else {
                this._createProduct(oProduct);
            }
        },

        _validateProductData: function(oProduct) {
            return oProduct.Name && 
                   oProduct.UnitPrice > 0 && 
                   oProduct.Quantity >= 0;
        },

        _createProduct: function(oProduct) {
            var that = this;
            
            // Format the data according to API requirements
            var oPayload = {
                Name: oProduct.Name,
                UnitPrice: parseFloat(oProduct.UnitPrice),
                Quantity: parseInt(oProduct.Quantity),
                Description: oProduct.Description || "",
                Category: oProduct.Category || "",
                MinimumStockLevel: parseInt(oProduct.MinimumStockLevel) || 0
            };
            
            fetch("/odata/v4/inventory/Product", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + btoa("alice:alice")
                },
                body: JSON.stringify(oPayload)
            })
            .then(function(response) {
                if (!response.ok) {
                    return response.json().then(function(error) {
                        throw new Error(error.error.message || "Unknown error occurred");
                    });
                }
                return response.json;
            })
            .then(function(data) {
                MessageToast.show("Product created successfully");
                that._oProductDialog.close();
                that.onRefresh();
            })
            .catch(function(error) {
                MessageBox.error("Error creating product: " + error.message);
            });
        },

        _updateProduct: function(oProduct) {
            var that = this;
            
            // Format the data according to API requirements
            var oPayload = {
                Name: oProduct.Name,
                UnitPrice: parseFloat(oProduct.UnitPrice),
                Quantity: parseInt(oProduct.Quantity),
                Description: oProduct.Description || "",
                Category: oProduct.Category || "",
                MinimumStockLevel: parseInt(oProduct.MinimumStockLevel) || 0
            };
            
            fetch("/odata/v4/inventory/Product(ID='" + oProduct.ID + "')", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Basic " + btoa("alice:alice")
                },
                body: JSON.stringify(oPayload)
            })
            .then(function(response) {
                if (!response.ok) {
                    return response.json().then(function(error) {
                        throw new Error(error.error.message || "Unknown error occurred");
                    });
                }
                MessageToast.show("Product updated successfully");
                that._oProductDialog.close();
                that.onRefresh();
            })
            .catch(function(error) {
                MessageBox.error("Error updating product: " + error.message);
            });
        },

        onCancelDialog: function() {
            if (this._oProductDialog) {
                this._oProductDialog.close();
            }
        },

        _deleteProduct: function (oProduct) {
            var that = this;
            
            fetch("/odata/v4/inventory/Product(ID='" + oProduct.ID + "')", {
                method: "DELETE",
                headers: {
                    "Authorization": "Basic " + btoa("alice:alice")
                }
            })
            .then(function(response) {
                if (!response.ok) {
                    return response.json().then(function(error) {
                        throw new Error(error.error.message || "Unknown error occurred");
                    });
                }
                MessageToast.show("Product deleted successfully");
                that.onRefresh();
            })
            .catch(function(error) {
                MessageBox.error("Error deleting product: " + error.message);
            });
        },

        // Formatter functions for enhanced display
        formatPriorityIcon: function(sPriority) {
            // Match icons with priority states
            switch(sPriority) {
                case "HIGH":
                    return "sap-icon://error";      // Red X
                case "MEDIUM":
                    return "sap-icon://alert";      // Orange alert
                case "LOW":
                    return "sap-icon://success";    // Green check
                default:
                    return "sap-icon://message-information"; // Blue info
            };
        },

        formatPriorityStyle: function(sPriority) {
            var oIconInfo = {
                "HIGH": { icon: "sap-icon://error", color: "#BB0000" },
                "MEDIUM": { icon: "sap-icon://alert", color: "#E78C07" },
                "LOW": { icon: "sap-icon://success", color: "#2B7D2B" }
            };
            
            return oIconInfo[sPriority] ? "color: " + oIconInfo[sPriority].color : "";
        },

        formatPriorityState: function(sPriority) {
            switch(sPriority) {
                case "HIGH":
                    return "Information"; // Blue
                case "MEDIUM":
                    return "Warning";     // Orange
                case "LOW":
                    return "Success";     // Green
                default:
                    return "Information"; // Blue
            }
        },

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
        },

        onCreateOrder: function() {
            if (!this._oOrderDialog) {
                this._oOrderDialog = sap.ui.xmlfragment(
                    "productlist.view.OrderDialog",
                    this
                );
                this.getView().addDependent(this._oOrderDialog);
            }
            
            // Initialize order model with workflow payload structure
            var oOrderModel = new JSONModel({
                company_id: "",
                product_id: "",
                quantity: 1
            });
            
            this._oOrderDialog.setModel(oOrderModel, "order");
            this._oOrderDialog.open();
        },

        onSubmitOrder: function() {
            var that = this;
            var oOrderModel = this._oOrderDialog.getModel("order");
            var oOrderData = oOrderModel.getData();
            
            // Basic validation
            if (!oOrderData.company_id || !oOrderData.product_id || !oOrderData.quantity) {
                MessageBox.error("Please fill in all required fields");
                return;
            }
            
            // Format payload as expected by CAP service
            var oPayload = {
                company_id: oOrderData.company_id,
                product_id: oOrderData.product_id,
                quantity: parseInt(oOrderData.quantity)
            };
            
            // Send to CAP workflow service
            fetch("/workflow/createSalesOrder", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(oPayload)
            })
            .then(function(response) {
                if (!response.ok) {
                    return response.json().then(function(error) {
                        throw new Error(error.message || "Failed to create sales order");
                    });
                }
                return response.json();
            })
            .then(function(data) {
                MessageBox.success("Sales order created successfully! Order ID: " + data.id, {
                    title: "Success",
                    onClose: function() {
                        that._oOrderDialog.close();
                    }
                });
            })
            .catch(function(error) {
                MessageBox.error("Error creating order: " + error.message);
            });
        },

        onCancelOrder: function() {
            if (this._oOrderDialog) {
                this._oOrderDialog.close();
            }
        }
    });
});