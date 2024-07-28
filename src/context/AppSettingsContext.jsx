import { createContext, useEffect, useState } from "react";

export const themes = {
  dark: "dark",
  light: "light",
};

function getTheme() {
  const theme = `${window?.localStorage?.getItem("theme")}`;
  if (Object.values(themes).includes(theme)) return theme;

  const userMedia = window.matchMedia("(prefers-color-scheme: light)");
  if (userMedia.matches) return themes.light;

  return themes.dark;
}

export const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export default ThemeProvider;
