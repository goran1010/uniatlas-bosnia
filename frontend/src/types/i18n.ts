import type { SystemLanguage } from "../utils/setInitialLanguage";

export type Language = SystemLanguage | "system";
export type SetLanguage = (language: Language) => void;
export type TFunction = (key: string) => string;
