import { useCallback, useState } from "react";
const MAX_NOTIFICATIONS = 5;

export type TypeNotification = "success" | "error" | "info" | "warning";

export interface Notification {
  id?: string;
  type: TypeNotification;
  message: string;
  duration?: number | null;
  persistent?: boolean;
}

export type AddNotification = (notification: Notification) => void;
export type RemoveNotification = (id: string) => void;

function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    ({
      id,
      type,
      message,
      duration = 3000,
      persistent = false,
    }: Notification) => {
      const notificationId = id ?? crypto.randomUUID();
      const newNotification = {
        id: notificationId,
        type,
        message,
        duration,
        persistent,
        createdAt: Date.now(),
      };

      setNotifications((prev) => {
        const existingNotificationIndex = prev.findIndex(
          (notification) => notification.id === notificationId,
        );

        if (existingNotificationIndex !== -1) {
          return prev.map((notification) =>
            notification.id === notificationId ? newNotification : notification,
          );
        }

        if (prev.length >= MAX_NOTIFICATIONS) {
          const removableIndex = prev.findIndex(
            (notification) => !notification.persistent,
          );

          if (removableIndex === -1) {
            return prev;
          }

          const nextNotifications = [...prev];
          nextNotifications.splice(removableIndex, 1);

          return [...nextNotifications, newNotification];
        }

        return [...prev, newNotification];
      });

      return notificationId;
    },
    [],
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
}

export { useNotification };
