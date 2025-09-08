import type { Session } from "next-auth";

export interface AzureSession extends Session {
    idToken: string;
    apiAccessToken: string;
    apiAccessTokenExpiresAt: number;
    user: {
        roles: string[];
        name?: string | null;
        email?: string | null;
        image?: string | null;
        family_name?: string | null;
        given_name?: string | null;
    };
}
