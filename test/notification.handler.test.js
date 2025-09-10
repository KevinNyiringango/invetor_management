const cds = require('@sap/cds/lib');
const { expect } = require('chai');

describe('Notification Service', () => {
    const { GET, POST } = cds.test().in(__dirname, '../srv');
    
    beforeAll(async () => {
        await cds.deploy(__dirname + '/../srv/inventory-service.cds').to('sqlite::memory:');
        this.notifications = [];
    });

    beforeEach(() => {
        // Reset notifications before each test
        this.notifications = [
            {
                ID: '11111111-1111-1111-1111-111111111111',
                recipient: 'alice',
                priority: 'HIGH',
                title: 'Test Notification 1',
                description: 'Test Description 1',
                isRead: false,
                method: 'UPDATE'
            },
            {
                ID: '22222222-2222-2222-2222-222222222222',
                recipient: 'alice',
                priority: 'MEDIUM',
                title: 'Test Notification 2',
                description: 'Test Description 2',
                isRead: false,
                method: 'UPDATE'
            }
        ];
    });

    it('should mark a specific notification as read', async () => {
        const notificationId = this.notifications[0].ID;
        const response = await POST('/odata/v4/notification/markAsRead', {
            notificationId: notificationId
        }, {
            auth: { username: 'alice', password: 'alice' }
        });

        expect(response.status).to.equal(200);
        expect(response.data.message).to.equal('Notification marked as read');

        // Verify the notification is marked as read
        const updatedNotification = await GET(`/odata/v4/notification/Notification(${notificationId})`, {
            auth: { username: 'alice', password: 'alice' }
        });
        expect(updatedNotification.isRead).to.be.true;
    });

    it('should mark all notifications as read', async () => {
        const response = await POST('/odata/v4/notification/markAllAsRead', {}, {
            auth: { username: 'alice', password: 'alice' }
        });

        expect(response.status).to.equal(200);
        expect(response.data.message).to.equal('All notifications marked as read');

        // Verify all notifications are marked as read
        const updatedNotifications = await GET('/odata/v4/notification/Notification', {
            auth: { username: 'alice', password: 'alice' }
        });
        
        updatedNotifications.forEach(notification => {
            expect(notification.isRead).to.be.true;
        });
    });
});
