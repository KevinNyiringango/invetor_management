using inventory from '../db/schema';

service InventoryService {
  entity Product as projection on inventory.Product;
  entity Order as projection on inventory.Order;
  entity OrderItem as projection on inventory.OrderItem;
  entity Company as projection on inventory.Company;

  annotate Product with @restrict : [
    { grant : [ '*' ], to : [ 'Admin' ] },
    { grant : [ 'READ'], to : [ 'User' ] }
  ];

  annotate Order with @restrict : [
    { grant : [ 'READ', 'DELETE', 'UPDATE' ], to : [ 'Admin' ] },
    { grant : [ 'READ', 'CREATE' ], to : [ 'User' ] }
  ];

  annotate OrderItem with @restrict : [
    { grant : [ 'READ', 'DELETE', 'UPDATE' ], to : [ 'Admin' ] },
    { grant : [ 'READ', 'CREATE' ], to : [ 'User' ] }
  ];

  annotate Company with @restrict : [
    { grant : [ '*' ], to : [ 'Admin' ] },
    { grant : [ 'READ'], to : [ 'User' ] }
  ];
}