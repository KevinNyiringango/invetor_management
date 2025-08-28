namespace inventory;
using { Attachments } from '@cap-js/attachments';
@odata.draft.enabled
@changelog : true
entity Product {
  key ID : UUID;
  Name : String(100);
  Description : String(255);
  Category : String(100);
  UnitPrice : Decimal(10,2) @mandatory;
  MinimumStockLevel : Integer;
  Quantity : Integer @mandatory; 
  LastUpdated : Date default $now;
  OrderItems : Association to OrderItem on OrderItems.Product = $self;
  attachments: Composition of many Attachments;
}

// @odata.draft.enabled
// @changelog : true
entity Company {
  key ID : UUID;
  Name : String(100) @mandatory;
  Address : String(255);
  Orders : Association to Order on Orders.Company = $self;
}
// @odata.draft.enabled
// @changelog : true
entity Order {
  key ID : UUID;
  OrderDate : DateTime default $now;
  Company : Association to one Company @mandatory;
  Items : Composition of many OrderItem on Items.Order = $self;
  TotalAmount : Decimal(10,2); 
}

// @changelog : true
entity OrderItem {
  key ID : UUID;
  Order : Association to one Order @mandatory;
  Product : Association to one Product @mandatory;
  Quantity : Integer @mandatory;
}