// https://nuxt.com/docs/api/configuration/nuxt-config
import { varlockVitePlugin } from "@varlock/vite-integration";

export default defineNuxtConfig({
    vite: {
        plugins: [varlockVitePlugin({ ssrInjectMode: "resolved-env" })],
        optimizeDeps: {
            include: [
                "@formkit/core",
                "@formkit/i18n",
            ]
        }
    },
    compatibilityDate: "2024-11-01",
    build: {
        analyze: false,
    },
    extends: [
        ["github:DCC-BS/nuxt-layers/auth"],
        ["github:DCC-BS/nuxt-layers/logger"],
    ],
    runtimeConfig: {
        apiUrl: process.env.API_URL,
        mailFrom: process.env.MAIL_FROM ?? "noreply@example.com",
        defaultAdmin: process.env.DEFAULT_ADMIN ?? "",
        siteUrl: process.env.NUXT_SITE_URL || "http://localhost:3000",
        public: {
            logger: {
                loglevel: process.env.LOG_LEVEL || "debug",
            },
        },
    },
    // Define app head configuration
    app: {
        head: {
            titleTemplate: "CourseBooker",
            htmlAttrs: {
                lang: "de",
            },
            meta: [
                { charset: "utf-8" },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1",
                },
                {
                    name: "apple-mobile-web-app-title",
                    content: "CourseBooker",
                },
                { name: "application-name", content: "CourseBooker" },
                { name: "msapplication-config", content: "/browserconfig.xml" },
            ],
        },
    },
    ui: {
        colorMode: false,
    },
    modules: [
        "@nuxt/ui",
        "@nuxtjs/i18n",
        "@dcc-bs/common-ui.bs.js",
        "@nuxtjs/mdc",
        "@nuxt/fonts",
        "@formkit/nuxt",
    ],
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    // localization
    i18n: {
        locales: [
            {
                code: "en",
                name: "English",
                file: "en.json",
            },
            {
                code: "de",
                name: "Deutsch",
                file: "de.json",
            },
        ],
        defaultLocale: "de",
        strategy: "no_prefix",
    },
    nitro: {
        experimental: {
            openAPI: true,
        },
        rollupConfig: {
            external: ["node:sqlite"],
        },
    },
    fonts: {
        providers: {
            google: false,
            bunny: false,
            adobe: false,
            fontshare: false,
            fontsource: false,
            googleicons: false,
        },
    },
});
