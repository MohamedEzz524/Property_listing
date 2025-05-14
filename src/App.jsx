import { useEffect, useState } from "react";
import Hero from "./Hero";
import ThemeProvider from "./ThemeProvider";
import Content from "./Content";

function App() {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-schema: dark)");
    return savedTheme ? savedTheme : systemPrefersDark ? "dark" : "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <div className="font-inter h-full w-full bg-[#fafafa] dark:bg-[#0a0a0a] transition-colors duration-200">
      {/* Hero */}
      <Hero theme={theme} />

      {/* Content */}
      <Content />

      {/* Theme */}
      <ThemeProvider theme={theme} toggleTheme={toggleTheme} />
    </div>
  );
}

export default App;
