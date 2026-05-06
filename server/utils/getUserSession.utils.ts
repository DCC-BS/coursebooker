import type { H3Event } from "h3";
import type { AzureSession } from "../models/azureSession.models";

import { getAuthContext } from "#layers/azure-auth/server/utils/authUtils"

export async function getUserSession(
    event: H3Event,
): Promise<AzureSession | null> {
    const { session } = await getAuthContext(event);
    return (session) as AzureSession | null;
}
