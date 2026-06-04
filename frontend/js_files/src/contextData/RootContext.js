import { createContext } from "react";
import { SERVER_STATUS } from "../utils/serverStatus";

const RootContext = createContext({
  language: "en",
  setLanguage: () => {},
  t: (key) => key,
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {},
  userData: null,
  setUserData: () => {},
  isServerLive: true,
  serverStatus: SERVER_STATUS.LIVE,
});

export { RootContext };
