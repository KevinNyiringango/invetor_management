using inventory from '../db/schema';

service InventoryService {
  entity Product as projection on inventory.Product;
  entity Order as projection on inventory.Order;
  entity OrderItem as projection on inventory.OrderItem;
  entity Company as projection on inventory.Company;
}