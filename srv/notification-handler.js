const cds = require('@sap/cds');

/**
 * Notification Service Handler
 * @module notificationService
 * @param {Service} srv - The CDS service instance
 */
function notificationHandlers(srv) {
  const { Notification } = srv.entities;

  /**
   * Before READ handler - Filter notifications by method for users
   */
  srv.before('READ', 'Notification', async (req) => {
    console.log('--- BEFORE READ Notification ---');
    console.log('Request user:', req.user.id, 'Roles:', req.user.roles);
    
    // If not admin, filter by method only
    if (!req.user.is('Admin')) {
      // Initialize WHERE clause if it doesn't exist
      if (!req.query.SELECT.where) {
        req.query.SELECT.where = [];
      }
      
      // Add AND operator if there are already conditions
      if (req.query.SELECT.where.length > 0) {
        req.query.SELECT.where.push('and');
      }
      
      // Add method filter to show only UPDATE notifications
      req.query.SELECT.where.push({ ref: ['method'] }, '=', { val: 'UPDATE' });
      
      console.log('Added method filter for user:', req.user.id);
      console.log('WHERE clause:', JSON.stringify(req.query.SELECT.where, null, 2));
    }
    
    console.log('--- END BEFORE READ Notification ---');
  });

  /**
   * After READ handler - Additional logging only
   */
  srv.after('READ', 'Notification', async (notifications, req) => {
    console.log('--- AFTER READ Notification ---');
    console.log('User:', req.user.id, 'Is Admin:', req.user.is('Admin'));
    console.log('Filtered notifications count:', Array.isArray(notifications) ? notifications.length : (notifications ? 1 : 0));
    
    return notifications;
  });
}

module.exports = notificationHandlers;
module.exports.notificationHandlers = notificationHandlers;