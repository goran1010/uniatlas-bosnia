import { useCallback, useState } from "react";
const MAX_NOTIFICATIONS = 5;

function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    ({ id, type = "info", message, duration = 3000, persistent = false }) => {
      const notificationId = id || crypto.randomUUID();
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

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
}

export { useNotification };
