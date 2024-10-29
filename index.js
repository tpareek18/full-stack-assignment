document.addEventListener('DOMContentLoaded', () => {
    const notif_form = document.getElementById('notification-form');
    const send_notif_btn = document.getElementById('send-notification-btn')
    const notif_feed = document.getElementById('notification-feed');

    // Time stamp function
    function formatTimestamp(timestamp) {
        const date = new Date(timestamp);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const time = date.toLocaleString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
        }).toLowerCase();
        
        return `${day} ${month} ${year}, ${time}`;
    }

    async function getNotifs() {
        try {
            const server_respose = await fetch('/api/notifications');
            if (! server_respose.ok) {
                throw new Error('Failed to fetch notifications');
            }

            const notifications = await response.json();

            const sortedNotifications = notifications
                .filter(notification => !notification.read)
                .sort((a, b) => b.timestamp - a.timestamp);

            notif_feed.innerHTML = '';

            sortedNotifications.forEach(notification => {
                const card = document.createElement('div');
                card.className = `notification-card ${notification.type}`;

                const message = document.createElement('p');
                message.className = 'notification-message';
                message.textContent = notification.content.text;

                const timestamp = document.createElement('div');
                timestamp.className = 'notification-timestamp';
                timestamp.textContent = formatTimestamp(notification.timestamp);

                card.appendChild(message);
                card.appendChild(timestamp);
                notif_feed.appendChild(card);
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
            console.error('Can\'t send notification', error);
        }
    });
});