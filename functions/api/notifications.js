// Pages not allowing to import uuid, found crypto API to use instead
function generateUUID() {
    return crypto.randomUUID();
}

// validate request body, if false, return 400
function validateNotification(notification) {
    return (notification && 
        ['alert', 'info', 'success'].includes(notification.type) &&
        notification.content?.text &&
        typeof notification.read === 'boolean'
    );
}

// retrieves all the notifications from KV storage
async function retrieveNotifsFromKVStore(env) {
    const notifications = await env.NOTIFICATIONS_KV.get('notifications', 'json');
    if (notifications) {
        return notifications;
    }
    return [];
}

// deletes all the notifications from KV storage
async function deleteNotifsFromKVStore(env) {
    await env.NOTIFICATIONS_KV.delete('notifications');
    return true;
}

function outputJSONResponse(body, status=200) {
    return new Response(JSON.stringify(body, null, 2), {
        status: status,
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

// main function that handles the different requests
export async function onRequest(context) {
    const { request, env } = context;

    try {
        switch (request.method) {
            case 'GET':
                const notifications = await retrieveNotifsFromKVStore(env);
                return outputJSONResponse(notifications);
    
            case 'POST':
                const body = await request.json();
                const notificationsToCreate = Array.isArray(body) ? body : [body];

                if (!notificationsToCreate.every(validateNotification)) {
                    return new Response('Request body is malinformed', {status: 400});
                }
                
                const existingNotifications = await retrieveNotifsFromKVStore(env);
                const newNotifications = notificationsToCreate.map(notification => ({
                    id: generateUUID(),
                    type: notification.type,
                    content: {
                        text: notification.content.text
                    },
                    read: notification.read,
                    timestamp: Date.now()
                }));

                const updatedNotifications = [...existingNotifications, ...newNotifications];
                await env.NOTIFICATIONS_KV.put('notifications', JSON.stringify(updatedNotifications));
                return outputJSONResponse(newNotifications);
    
            case 'DELETE':
                await deleteNotifsFromKVStore(env);
                return outputJSONResponse({message: 'Notifications deleted successfully!'});
    
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