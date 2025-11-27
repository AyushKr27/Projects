import React, { useEffect, useState } from "react";

const STORAGE_KEY = "theme-preference";

function getSystemPrefersDark() {
    if (typeof window === "undefined") return false;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved || "system";
        } catch {
            return "system";
        }
    });

    useEffect(() => {
        const root = document.documentElement;

        const apply = (t) => {
            if (t === "dark") {
                root.classList.add("dark");
            } else if (t === "light") {
                root.classList.remove("dark");
            } else {
                if (getSystemPrefersDark()) root.classList.add("dark");
                else root.classList.remove("dark");
            }
        };

        apply(theme);

        let mq;
        const handleChange = (e) => {
            if (theme === "system") apply("system");
        };
        if (window.matchMedia) {
            mq = window.matchMedia("(prefers-color-scheme: dark)");
            mq.addEventListener ? mq.addEventListener("change", handleChange) : mq.addListener(handleChange);
        }

        return () => {
            if (mq) {
                mq.removeEventListener ? mq.removeEventListener("change", handleChange) : mq.removeListener(handleChange);
            }
        };
    }, [theme]);

    const toggle = () => {
        const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
        try {
            localStorage.setItem(STORAGE_KEY, next);
        } catch {}
        setTheme(next);
    };

    return (
        <button
            onClick={toggle}
            title={`Theme: ${theme} — click to change`}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
            {theme === "light" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-yellow-400" viewBox="0 0 24 24" fill="currentColor"><path d="M6.76 4.84l-1.8-1.79L3.17 4.84 4.97 6.63 6.76 4.84zM1 13h3v-2H1v2zm10 9h-2v-3h2v3zM17.24 4.84l1.79 1.79 1.8-1.8-1.79-1.79-1.8 1.8zM20 11v2h3v-2h-3zM4.93 19.07l1.79-1.79-1.79-1.79-1.79 1.79 1.79 1.79zM12 6a6 6 0 100 12A6 6 0 0012 6z"/></svg>
            )}
            {theme === "dark" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-indigo-300" viewBox="0 0 24 24" fill="currentColor"><path d="M21.64 13.14A9 9 0 1110.86 2.36 7 7 0 0021.64 13.14z"/></svg>
            )}
            {theme === "system" && (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-slate-500" viewBox="0 0 24 24" fill="currentColor"><path d="M20 7V4h-3V1H7v3H4v3H1v10h3v3h10v-3h3v-3h3V7zM7 4h10v3H7V4z"/></svg>
            )}
        </button>
    );
}
