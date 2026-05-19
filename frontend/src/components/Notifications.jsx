import { useContext, useEffect, useRef } from "react";
import { NotificationContext } from "../contextData/NotificationContext";
import { LanguageContext } from "../contextData/LanguageContext";

function getNotificationStyles(type) {
  switch (type) {
    case "success":
      return "notification-success";
    case "error":
      return "notification-error";
    case "warning":
      return "notification-warning";
    case "info":
    default:
      return "notification-info";
  }
}

function getNotificationRole(type) {
  if (type === "error" || type === "warning") {
    return "alert";
  }
  return "status";
}

function Notifications() {
  const { notifications, removeNotification } = useContext(NotificationContext);
  const { t } = useContext(LanguageContext);
  const timerMapRef = useRef(new Map());

  useEffect(() => {
    let newTimerRef = timerMapRef.current;

    // Set timers for new notifications only
    notifications?.forEach((notification) => {
      if (notification.duration && !newTimerRef.has(notification.id)) {
        const timer = setTimeout(() => {
          removeNotification(notification.id);
          newTimerRef.delete(notification.id);
        }, notification.duration);

        newTimerRef.set(notification.id, timer);
      }
    });

    // Clean up timers for notifications that were removed
    return () => {
      newTimerRef.forEach((timer, id) => {
        const stillExists = notifications?.some(
          (notification) => notification.id === id,
        );
        if (!stillExists) {
          clearTimeout(timer);
          newTimerRef.delete(id);
        }
      });
    };
  }, [notifications, removeNotification]);

  if (!notifications?.length) return null;

  return (
    <aside
      className="fixed top-15 right-4 z-50 w-[min(92vw,24rem)] select-none opacity-90 hover:opacity-100 transition-opacity"
      aria-label={t("notifications.title")}
      aria-live="polite"
      aria-relevant="additions text"
    >
      <ul className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            role={getNotificationRole(notification.type)}
            className={`relative px-4 py-3 rounded-lg shadow-lg w-full flex flex-col justify-center items-center ${getNotificationStyles(
              notification.type,
            )}`}
          >
            <p>{notification.message}</p>

            <button
              type="button"
              onClick={() => removeNotification(notification.id)}
              aria-label={t("notifications.dismiss")}
              className="absolute top-2 right-2 text-sm opacity-80 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export { Notifications };
