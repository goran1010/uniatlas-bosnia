import { useCallback, useState } from "react";
const MAX_NOTIFICATIONS = 5;

function useNotification() {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback(
    ({ type = "info", message, duration = 3000 }) => {
      const newNotification = {
        id: crypto.randomUUID(),
        type,
        message,
        duration,
        createdAt: Date.now(),
      };

      setNotifications((prev) => {
        if (prev.length >= MAX_NOTIFICATIONS) {
          return [...prev.slice(1), newNotification];
        }
        return [...prev, newNotification];
      });
    },
    [],
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, addNotification, removeNotification };
}

export { useNotification };
