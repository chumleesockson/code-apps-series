import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import * as path from "path"
import { powerApps, powerAppsCorsOrigins } from "./plugins/powerApps"

// https://vite.dev/config/
export default defineConfig({
	base: "./",
	server: {
		cors: {
			// allow apps.powerapps.com to access dev server
			origin: powerAppsCorsOrigins,
		},
	},
	plugins: [react(), tailwindcss(), powerApps()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
})
