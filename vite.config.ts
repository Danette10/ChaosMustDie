import {defineConfig, loadEnv} from "vite"
import react from "@vitejs/plugin-react"
import {resolve} from "path"

export default defineConfig(({mode}) => {
    const env = loadEnv(mode, process.cwd(), "")

    return {
        plugins: [react()],
        server: {
            port: parseInt(env.VITE_PORT) || 3000,
            strictPort: true,
        },
        build: {
            rollupOptions: {
                input: {
                    popup: resolve(__dirname, "index.html"),
                },
            },
        },
        define: {
            "process.env": env,
        },
    }
})
