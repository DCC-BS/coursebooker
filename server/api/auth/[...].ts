import AzureADProvider from "next-auth/providers/azure-ad";
import { NuxtAuthHandler } from "#auth";
import { useRuntimeConfig } from "#imports";
import type { AzureSession } from "~~/server/models/azureSession.models";

// Helper function to decode JWT without verification (for reading claims)
function decodeJWT(token: string) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(
                    (c) =>
                        `%${(`00${c.charCodeAt(0).toString(16)}`).slice(-2)}`,
                )
                .join(""),
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
    }
}

async function getApiAccessToken(refreshToken: string): Promise<string> {
    const config = useRuntimeConfig();
    const url = `https://login.microsoftonline.com/${config.azureAdTenantId}/oauth2/v2.0/token`;
    const body = new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: refreshToken,
        client_id: config.azureAdClientId,
        client_secret: config.azureAdClientSecret,
    });
    const response = await $fetch<{ access_token: string }>(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body,
    });

    if (!response.access_token) {
        throw new Error("Failed to get API access token");
    }
    return response.access_token;
}

export default NuxtAuthHandler({
    secret: useRuntimeConfig().authSecret,
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        AzureADProvider.default({
            clientId: useRuntimeConfig().azureAdClientId,
            clientSecret: useRuntimeConfig().azureAdClientSecret,
            tenantId: useRuntimeConfig().azureAdTenantId,
            authorization: {
                params: {
                    scope: "openid profile email offline_access User.Read",
                },
            },
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            const extendedToken = token;
            if (account && profile) {
                extendedToken.accessToken = account.access_token;
                extendedToken.refreshToken = account.refresh_token;
                // ID Token for client side checks
                extendedToken.idToken = account.id_token;
            }
            return extendedToken;
        },
        async session({ session, token }) {
            const azureSession = session as unknown as AzureSession;
            azureSession.idToken = token.idToken as string;

            // Check if we need to refresh the API access token
            const currentTimeInSeconds = Math.floor(Date.now() / 1000);
            const tokenExpired =
                !azureSession.apiAccessTokenExpiresAt ||
                azureSession.apiAccessTokenExpiresAt <= currentTimeInSeconds;

            if (!azureSession.apiAccessToken || tokenExpired) {
                azureSession.apiAccessToken = await getApiAccessToken(
                    token.refreshToken as string,
                );
                const decoded = decodeJWT(azureSession.apiAccessToken);
                azureSession.apiAccessTokenExpiresAt = decoded.exp;
                azureSession.user.roles = decoded.roles;
            }
            return azureSession;
        },
    },
});
