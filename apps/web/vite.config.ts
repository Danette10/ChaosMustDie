import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "../../packages/ui"),
            "@styles": path.resolve(__dirname, "../../packages/ui/styles"),
            react: path.resolve(__dirname, "../../node_modules/react"),
            "react-dom": path.resolve(__dirname, "../../node_modules/react-dom"),
        },
    },
    server: {
        https: {
            key: fs.readFileSync(path.resolve(__dirname, "../../certs/key.pem")),
            cert: fs.readFileSync(path.resolve(__dirname, "../../certs/cert.pem")),
        },
        host: "localhost",
        port: 5173,
    },
});
