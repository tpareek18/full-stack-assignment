// Pages not allowing to import uuid, found crypto API to use instead
function generateUUID() {
    return crypto.randomUUID();
}

function validateNotification(notification) {
    return (notification && 
        ['alert', 'info', 'success'].includes(notification.type) &&
        notification.content?.text &&
        typeof notification.read === 'boolean'
    );
}

async function retrieveNotifsFromKVStore(env) {
    const notifications = await env.NOTIFICATIONS_KV.get('notifications', 'json');
    return notifications || [];
}

async function deleteNotifsFromKV(env) {
    await env.NOTIFICATIONS_KV.delete('notifications');
    return true;
}

export async function onRequest(context) {
    const { request, env } = context;

    try {
        switch (request.method) {
            case 'GET':
                const notifications = await retrieveNotifsFromKVStore(env);
                return new Response(JSON.stringify(notifications, null, 2), {
                    headers: {
                    'Content-Type': 'application/json',
                    }
                });
    
            case 'POST':
                const body = await request.json();
                const notificationsToCreate = Array.isArray(body) ? body : [body];

                if (!notificationsToCreate.every(validateNotification)) {
                    return new Response('Invalid notification format', { status: 400 });
                }
                
                const existingNotifications = await env.NOTIFICATIONS_KV.get('notifications', 'json') || [];

                const processedNotifications = notificationsToCreate.map(notification => ({
                    id: generateUUID(),
                    type: notification.type,
                    content: {
                        text: notification.content.text
                    },
                    read: notification.read,
                    timestamp: Date.now()
                }));

                const updatedNotifications = [...existingNotifications, ...processedNotifications];
                await env.NOTIFICATIONS_KV.put('notifications', JSON.stringify(updatedNotifications));

                return new Response(JSON.stringify(processedNotifications, null, 2), {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
    
            case 'DELETE':
                await deleteNotifsFromKV(env);
                return new Response(JSON.stringify({
                    message: 'Notifications deleted successfully!'
                }), {
                    headers: {
                    'Content-Type': 'application/json',
                    }
                });
    
            default:
                return new Response('Method not allowed', { status: 405 });
        }
    } catch (error) {
        console.error('Error processing request:', error);
        return new Response('Internal Server Error', { 
            status: 500,
            headers: manageCORSForRequests()
        });
    }
}