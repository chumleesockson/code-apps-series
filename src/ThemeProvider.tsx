import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react"

type Theme = "light" | "dark"

interface ThemeContextValue {
	theme: Theme
	toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const THEME_STORAGE_KEY = "app-theme"

function getSystemTheme(): Theme {
	if (typeof window !== "undefined" && window.matchMedia) {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light"
	}
	return "dark"
}

function getInitialTheme(): Theme {
	if (typeof window !== "undefined") {
		const stored = localStorage.getItem(THEME_STORAGE_KEY)
		if (stored === "light" || stored === "dark") {
			return stored
		}
	}
	return getSystemTheme()
}

interface ThemeProviderProps {
	children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(getInitialTheme)

	useEffect(() => {
		const root = document.documentElement

		// Apply theme class
		if (theme === "dark") {
			root.classList.add("dark")
		} else {
			root.classList.remove("dark")
		}

		// Save to localStorage
		localStorage.setItem(THEME_STORAGE_KEY, theme)
	}, [theme])

	// Listen for system theme changes
	useEffect(() => {
		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

		const handleChange = (e: MediaQueryListEvent) => {
			// Only auto-switch if user hasn't set a preference
			const stored = localStorage.getItem(THEME_STORAGE_KEY)
			if (!stored) {
				setTheme(e.matches ? "dark" : "light")
			}
		}

		mediaQuery.addEventListener("change", handleChange)
		return () => mediaQuery.removeEventListener("change", handleChange)
	}, [])

	const toggleTheme = () => {
		setTheme((prev) => (prev === "dark" ? "light" : "dark"))
	}

	return (
		<ThemeContext.Provider value={{ theme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	)
}

export function useTheme() {
	const context = useContext(ThemeContext)
	if (context === undefined) {
		throw new Error("useTheme must be used within a ThemeProvider")
	}
	return context
}
