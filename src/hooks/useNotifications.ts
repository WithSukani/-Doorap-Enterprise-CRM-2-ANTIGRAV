
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Notification } from '../../types';

export const useNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial Fetch
    const fetchNotifications = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching notifications:', error);
            } else {
                // Map keys to camelCase if needed, but here we'll map manually to match Type
                const mappedData: Notification[] = (data || []).map((n: any) => ({
                    id: n.id,
                    userId: n.user_id,
                    type: n.type,
                    category: n.category,
                    title: n.title,
                    message: n.message,
                    linkUrl: n.link_url,
                    isRead: n.is_read,
                    createdAt: n.created_at
                }));
                setNotifications(mappedData);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Subscribe to Realtime Changes
        const channel = supabase
            .channel('notifications_all')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                },
                (payload) => {
                    // Check if the notification belongs to the current user
                    // Note: payload.new contains raw DB columns (snake_case)
                    supabase.auth.getUser().then(({ data: { user } }) => {
                        if (user && payload.new.user_id === user.id) {
                            const newNotification: Notification = {
                                id: payload.new.id,
                                userId: payload.new.user_id,
                                type: payload.new.type,
                                category: payload.new.category,
                                title: payload.new.title,
                                message: payload.new.message,
                                linkUrl: payload.new.link_url,
                                isRead: payload.new.is_read,
                                createdAt: payload.new.created_at
                            };

                            // Add to state instantly
                            setNotifications(prev => [newNotification, ...prev]);

                            // Optional: Play sound
                            // const audio = new Audio('/notification-sound.mp3');
                            // audio.play().catch(e => console.log('Audio play failed', e));
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user.id);
        }
    };

    const clearAll = async () => {
        // Optimistic update
        setNotifications([]);

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await supabase
                .from('notifications')
                .delete()
                .eq('user_id', user.id);
        }
    };

    return {
        notifications,
        loading,
        markAsRead,
        markAllAsRead,
        clearAll,
        refetch: fetchNotifications
    };
};
