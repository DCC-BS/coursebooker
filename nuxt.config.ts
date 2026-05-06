// https://nuxt.com/docs/api/configuration/nuxt-config
import { varlockVitePlugin } from "@varlock/vite-integration";

export default defineNuxtConfig({
    vite: {
        plugins: [varlockVitePlugin({ ssrInjectMode: "resolved-env" })],
    },
    compatibilityDate: "2024-11-01",
    build: {
        analyze: false,
    },
    runtimeConfig: {
        githubToken: process.env.GITHUB_TOKEN,
        apiUrl: process.env.API_URL,
        azureAdTenantId: process.env.AZURE_AD_TENANT_ID ?? "NA",
        azureAdClientId: process.env.AZURE_AD_CLIENT_ID ?? "NA",
        azureAdClientSecret: process.env.AZURE_AD_CLIENT_SECRET ?? "NA",
        authSecret: process.env.AUTH_SECRET ?? "NA",
        mailFrom: process.env.MAIL_FROM ?? "noreply@example.com",
        defaultAdmin: process.env.DEFAULT_ADMIN ?? "",
        siteUrl: process.env.NUXT_SITE_URL || "http://localhost:3000",
        public: {
            logger_bs: {
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
        "@dcc-bs/logger.bs.js",
        "@dcc-bs/feedback-control.bs.js",
        "@dcc-bs/common-ui.bs.js",
        "@nuxtjs/mdc",
        "@sidebase/nuxt-auth",
        "@nuxt/fonts",
        "@formkit/nuxt",
    ],
    devtools: { enabled: true },
    css: ["~/assets/css/main.css"],
    "feedback-control.bs.js": {
        repo: "Feedback",
        owner: "DCC-BS",
        project: "CourseBooker",
        githubToken: process.env.GITHUB_TOKEN,
    },
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
    auth: {
        isEnabled: true,
        globalAppMiddleware: true,
        originEnvKey: "AUTH_ORIGIN",
        provider: {
            type: "authjs",
            defaultProvider: "azureAd",
            addDefaultCallbackUrl: true,
        },
        sessionRefresh: {
            enablePeriodically: 10000,
            enableOnWindowFocus: true,
        },
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
