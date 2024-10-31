document.addEventListener('DOMContentLoaded', () => {
    const notif_form = document.getElementById('notification-form');
    const send_notif_btn = document.getElementById('send-notification-btn')
    const notif_feed = document.getElementById('notification-feed');

    // Time stamp function
    function createTimestamp(timestamp) {
        const date = new Date(timestamp);
        return `${date.getDate()} ${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}, 
        ${date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()}`;
    }

    async function getNotifs() {
        try {
            const server_response = await fetch('/api/notifications');
            if (! server_response.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const notifications = await server_response.json();
            const sortedNotifications = [];
            for (const notification of notifications) {
                if (!notification.read) {
                    sortedNotifications.push(notification);
                }
            }
            sortedNotifications.sort((i, j) => j.timestamp - i.timestamp);
            notif_feed.innerHTML = '';

            sortedNotifications.forEach(notification => {
                const notification_card = document.createElement('div');
                notification_card.className = `notification-card ${notification.type}`;

                const notification_message = document.createElement('p');
                notification_message.className = 'notification-notification_message';
                notification_message.textContent = notification.content.text;

                const timestamp = document.createElement('div');
                timestamp.className = 'notification-timestamp';
                timestamp.textContent = createTimestamp(notification.timestamp);

                notification_card.appendChild(notification_message);
                notification_card.appendChild(timestamp);
                notif_feed.appendChild(notification_card);
            });
        } catch (error) {
            console.error('Cannot send notification', error);
        }
    }

    getNotifs();

    notif_form.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        const notif_message = document.getElementById('notification-message');
        const notif_type = document.getElementById('notification-type');

        const notif_obj = {
            type: notif_type.value,
            content: {
                text: notif_message.value
            },
            read: false
        };
        
        try {
            const server_respose = await fetch('/api/notifications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(notif_obj)
            });

            if (server_respose.ok) {
                notif_form.reset();
                await getNotifs();
            }
        } catch (error) {
            console.error('Cannot send notification', error);
        }
    });
});