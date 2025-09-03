using inventory from '../db/schema';

service InventoryService {
  entity Product as projection on inventory.Product;
  entity Order as projection on inventory.Order;
  entity OrderItem as projection on inventory.OrderItem;
  entity Company as projection on inventory.Company;
  
  // Expose notifications for users to view their own
  entity Notification as projection on inventory.Notification;
  
  // existing actions
  action submitOrder(companyId: UUID, items: array of {
    productId: UUID;
    quantity: Integer;
  }) returns {
    orderId: UUID;
    totalAmount: Decimal;
    status: String;
    itemsProcessed: Integer;
  };
  
  action cancelOrder(orderId: UUID) returns {
    orderId: UUID;
    status: String;
    message: String;
  };
  
  annotate Product with @restrict : [
    { grant : [ '*' ], to : [ 'Admin' ] },
    { grant : [ 'READ'], to : [ 'User' ] }
  ];
  annotate Product with @changelog : true;

  annotate Order with @restrict : [
    { grant : [ 'READ', 'DELETE', 'UPDATE' ], to : [ 'Admin' ] },
    { grant : [ 'READ', 'CREATE' ], to : [ 'User' ] }
  ];
  annotate Order with @changelog : true;

  annotate OrderItem with @restrict : [
    { grant : [ 'READ', 'DELETE', 'UPDATE' ], to : [ 'Admin' ] },
    { grant : [ 'READ', 'CREATE' ], to : [ 'User' ] }
  ];
  annotate OrderItem with @changelog : true;

  annotate Company with @restrict : [
    { grant : [ '*' ], to : [ 'Admin' ] },
    { grant : [ 'READ'], to : [ 'User' ] }
  ];
  annotate Company with @changelog : true;
  
  // Users can only read UPDATE notifications, Admins can see all
  // Add WHERE restriction for users to only see UPDATE notifications
  annotate Notification with @restrict : [
    { grant : [ '*' ], to : [ 'Admin' ] },
    { grant : [ 'READ', 'UPDATE'], to : [ 'User' ], where : 'method = UPDATE' }
  ];
}