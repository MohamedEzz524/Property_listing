import React from "react";
import { motion } from "framer-motion";
import logo from "./assets/Logo2-removebg-preview.png";

const ThemeProvider = ({ theme, toggleTheme }) => {
  return (
    <div className="w-full container fixed top-5 right-0 z-50 flex justify-between items-center">
      <motion.img
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
        src={logo}
        alt="Logo"
        className="w-32 h-16 bg-black/10 dark:bg-white/10 backdrop-blur-xl rounded-sm shadow-sm"
      />
      {/* Theme Toggle - Enhanced Version */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <div
          className="relative border-none py-1  flex rounded-full shadow-lg 
              bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl"
          style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        >
          {/* Animated thumb */}
          <motion.span
            className={`absolute left-1 top-0.5 w-[calc(50%-0.25rem)] h-[calc(100%-0.25rem)] rounded-full z-0
                  bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-amber-300 dark:to-orange-400
                  shadow-md`}
            initial={{ x: theme === "dark" ? 0 : "100%" }}
            animate={{ x: theme === "dark" ? 0 : "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />

          {/* Light/Dark buttons */}
          {["dark", "light"].map((mode) => (
            <motion.button
              key={mode}
              onClick={toggleTheme}
              className={`relative z-10 px-3 py-1 rounded-full text-sm font-medium cursor-pointer
                  ${theme === mode ? "text-white" : "text-gray-600 dark:text-gray-300"}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label={`Switch to ${mode} mode`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeProvider;
