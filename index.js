document.addEventListener('DOMContentLoaded', () => {
    const notif_form = document.getElementById('notification-form');
    const send_notif_btn = document.getElementById('send-notification-btn');

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
            }
        } catch (error) {
            console.error('Can\'t send notification', error);
        }
    });
});