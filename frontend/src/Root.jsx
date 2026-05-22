import { Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar/Navbar";
import { Footer } from "./components/Footer";
import { useState } from "react";
import { UserDataContext } from "./contextData/UserDataContext";
import { Spinner } from "./utils/Spinner";
import { useStatusCheck } from "./customHooks/useStatusCheck";
import { Notifications } from "./components/Notifications";
import { NotificationContext } from "./contextData/NotificationContext";
import { useNotification } from "./customHooks/useNotification";
import { LongWaitInfo } from "./utils/longWaitInfo";
import { useServerWakeUp } from "./customHooks/useServerWakeUp";
import { useCloseMenu } from "./customHooks/useCloseMenu";
import { LanguageContext } from "./contextData/LanguageContext";
import { useLanguage } from "./customHooks/useLanguage";
import { HelmetProvider } from "react-helmet-async";

function Root() {
  const [loading, setLoading] = useState(true);
  const [longWait, setLongWait] = useState(false);
  const { notifications, addNotification, removeNotification } =
    useNotification();
  const [serverIsDown, setServerIsDown] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const closeMenu = useCloseMenu();

  useServerWakeUp({
    setLongWait,
    setServerIsDown,
  });

  const { userData, setUserData } = useStatusCheck(
    setLoading,
    addNotification,
    longWait,
  );

  return (
    <LanguageContext value={{ language, setLanguage, t }}>
      <HelmetProvider>
        {longWait || serverIsDown ? (
          <LongWaitInfo serverIsDown={serverIsDown} />
        ) : (
          <NotificationContext
            value={{
              notifications,
              addNotification,
              removeNotification,
            }}
          >
            <UserDataContext value={{ userData, setUserData }}>
              <>
                <Navbar closeMenu={closeMenu} />
                <Notifications />
                <main className="flex-1 flex flex-col items-center justify-center px-2 md:px-5 lg:px-10 xl:px-25 2xl:px-50 relative bg-(--app-bg) text-(--text-primary)">
                  {loading ? <Spinner /> : <Outlet />}
                </main>
                <Footer />
              </>
            </UserDataContext>
          </NotificationContext>
        )}
      </HelmetProvider>
    </LanguageContext>
  );
}

export { Root };
