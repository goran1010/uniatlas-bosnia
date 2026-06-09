import { use, useEffect, useRef } from "react";
import { RootContext } from "../contextData/RootContext";
import type { TypeNotification } from "../customHooks/useNotification";

function getNotificationStyles(type: TypeNotification) {
  switch (type) {
    case "success":
      return "bg-green-100 text-green-900 border border-green-300";
    case "error":
      return "bg-red-100 text-red-900 border border-red-300";
    case "warning":
      return "bg-yellow-100 text-amber-900 border border-amber-300";
    case "info":
    default:
      return "bg-sky-100 text-sky-900 border border-sky-300";
  }
}

function getNotificationRole(type: TypeNotification) {
  if (type === "error" || type === "warning") {
    return "alert";
  }
  return "status";
}

function Notifications() {
  const { notifications, removeNotification } = use(RootContext);
  const { t } = use(RootContext);
  const timerMapRef = useRef(new Map());

  useEffect(() => {
    const newTimerRef = timerMapRef.current;

    // Set timers for new notifications only
    notifications.forEach((notification) => {
      const shouldAutoDismiss =
        !notification.persistent &&
        typeof notification.duration === "number" &&
        notification.duration > 0;

      if (!shouldAutoDismiss && newTimerRef.has(notification.id)) {
        clearTimeout(newTimerRef.get(notification.id));
        newTimerRef.delete(notification.id);
      }

      if (shouldAutoDismiss && !newTimerRef.has(notification.id)) {
        const timer = setTimeout(() => {
          if (notification.id) {
            removeNotification(notification.id);
            newTimerRef.delete(notification.id);
          }
        }, notification.duration ?? 0);

        if (notification.id) {
          newTimerRef.set(notification.id, timer);
        }
      }
    });

    // Clean up timers for notifications that were removed
    return () => {
      newTimerRef.forEach((timer, id) => {
        const stillExists = notifications.some(
          (notification) => notification.id === id,
        );
        if (!stillExists) {
          clearTimeout(timer);
          newTimerRef.delete(id);
        }
      });
    };
  }, [notifications, removeNotification]);

  if (!notifications.length) return null;

  return (
    <aside
      className="fixed top-18 right-4 z-20 w-[min(92vw,24rem)] select-none opacity-90 hover:opacity-100 transition-opacity"
      aria-label={t("notifications.title")}
      aria-live="polite"
      aria-relevant="additions text"
    >
      <ul className="flex flex-col gap-2">
        {notifications.map((notification) => (
          <li key={notification.id} className="w-full">
            <div
              role={getNotificationRole(notification.type)}
              aria-atomic="true"
              className={`relative px-4 py-3 rounded-lg shadow-lg w-full flex flex-col justify-center items-center ${getNotificationStyles(
                notification.type,
              )}`}
            >
              <p>{notification.message}</p>

              <button
                type="button"
                onClick={() => {
                  removeNotification(notification.id);
                }}
                aria-label={t("notifications.dismiss")}
                className="absolute top-0 right-1 text-sm font-semibold text-current cursor-pointer"
              >
                ✖
              </button>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}

export { Notifications };
