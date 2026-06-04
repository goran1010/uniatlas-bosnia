import { useState } from "react";
import { RootContext } from "../js_files/src/contextData/RootContext";
import { useLanguage } from "../js_files/src/customHooks/useLanguage";
import { useNotification } from "../js_files/src/customHooks/useNotification";
import { SERVER_STATUS } from "../js_files/src/utils/serverStatus";

function RootContextProvider({
  children,
  initialUserData = null,
  rootValue = {},
}) {
  const { language, setLanguage, t } = useLanguage();
  const [userData, setUserData] = useState(initialUserData);
  const { notifications, addNotification, removeNotification } =
    useNotification();

  return (
    <RootContext
      value={{
        language,
        setLanguage,
        t,
        notifications,
        addNotification,
        removeNotification,
        userData,
        setUserData,
        isServerLive: true,
        serverStatus: SERVER_STATUS.LIVE,
        ...rootValue,
      }}
    >
      {children}
    </RootContext>
  );
}

export { RootContextProvider };
