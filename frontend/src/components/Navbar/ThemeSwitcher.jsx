import { useContext } from "react";
import { NotificationContext } from "../../contextData/NotificationContext";

function ThemeSwitcher({ setMode, setThemeMenuOpen }) {
  const { addNotification } = useContext(NotificationContext);

  return (
    <div className="menu-shell z-50 pb-2 absolute top-full left-0 w-full text-center rounded-b user-select-none cursor-pointer backdrop-blur-sm ">
      <ul className="flex flex-col">
        <li>
          <button
            type="button"
            className="menu-item block w-full py-2 px-4"
            onClick={() => {
              setMode("system");
              addNotification({
                type: "info",
                message: "Switched to system theme",
              });
              setThemeMenuOpen(false);
            }}
          >
            System
          </button>
        </li>
        <li>
          <button
            type="button"
            className="menu-item block w-full py-2 px-4"
            onClick={() => {
              setMode("light");
              addNotification({
                type: "info",
                message: "Switched to light theme",
              });
              setThemeMenuOpen(false);
            }}
          >
            Light
          </button>
        </li>
        <li>
          <button
            type="button"
            className="menu-item block w-full py-2 px-4"
            onClick={() => {
              setMode("dark");
              addNotification({
                type: "info",
                message: "Switched to dark theme",
              });
              setThemeMenuOpen(false);
            }}
          >
            Dark
          </button>
        </li>
      </ul>
    </div>
  );
}

export { ThemeSwitcher };
