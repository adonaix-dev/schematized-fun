import { defineConfig } from "tsdown";

export default defineConfig({
    entry: "./src/index.ts",
    dts: true,
    fixedExtension: false,
    onSuccess: 'prettier -wu --ignore-path "" ./dist/**/*',
    inputOptions: {
        experimental: {
            attachDebugInfo: "none",
        },
    },
    outputOptions: {
        comments: false,
    },
});
