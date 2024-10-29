document.addEventListener('DOMContentLoaded', () => {
    const notif_form = document.getElementById('notification-form');
    const notif_message = document.getElementById('notification-message');
    const notif_type = document.getElementById('notification-type');
    const send_notif_btn = document.getElementById('send-notification-btn');

    notif_form.addEventListener('submit', async (e) => {
        const notif_obj = {
            type: notif_type.value,
            content: {
                text: notif_message.value
            },
            read: false
        };

        const server_respose = await fetch('/api/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(notif_obj)
        });

        if (! server_respose.ok) {
            console.error('Failed to send notification');
        }

        notif_form.reset();
        alert('Notification sent successfully!');
    });
});