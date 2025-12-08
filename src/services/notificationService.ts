
import { supabase } from '../lib/supabase';

// Types derived from DB schema
export type NotificationType = 'info' | 'warning' | 'success' | 'error';
export type NotificationCategory = 'message' | 'maintenance' | 'finance' | 'compliance' | 'system';

interface SendNotificationParams {
    userId: string;
    title: string;
    message: string;
    type?: NotificationType;
    category?: NotificationCategory;
    linkUrl?: string; // Optional link to redirect user
}

/**
 * Sends a notification by inserting it into the Supabase 'notifications' table.
 * 
 * @param params Notification details
 * @returns { success: boolean, error: any }
 */
export const sendNotification = async ({
    userId,
    title,
    message,
    type = 'info',
    category = 'system',
    linkUrl
}: SendNotificationParams) => {
    try {
        const { error } = await supabase.from('notifications').insert({
            user_id: userId,
            title,
            message,
            type,
            category,
            link_url: linkUrl,
            is_read: false,
            created_at: new Date().toISOString()
        });

        if (error) {
            console.error('Error sending notification:', error);
            return { success: false, error };
        }

        return { success: true };
    } catch (err) {
        console.error('Unexpected error sending notification:', err);
        return { success: false, error: err };
    }
};
