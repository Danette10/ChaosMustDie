import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "../../packages/ui"),
            "@styles": path.resolve(__dirname, "../../packages/ui/styles"),
            react: path.resolve(__dirname, "../../node_modules/react"),
            "react-dom": path.resolve(__dirname, "../../node_modules/react-dom")
        }
    },
    build: {
        rollupOptions: {
            input: {
                popup: path.resolve(__dirname, "index.html")
            }
        },
        outDir: "dist"
    }
});
