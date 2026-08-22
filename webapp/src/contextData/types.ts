import type { Dispatch, SetStateAction } from "react";

import type { UserData } from "../types/auth";
import type { Notification } from "../types/notification";
import type { Language, SetLanguage } from "../types/i18n";
import type { ServerStatus } from "../utils/serverStatus";

export interface RootContextType {
  language: Language;
  setLanguage: SetLanguage;
  t: (key: string) => string;
  notifications: Notification[];
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string | undefined) => void;
  userData: UserData;
  setUserData: Dispatch<SetStateAction<UserData>>;
  serverStatus: ServerStatus;
}
