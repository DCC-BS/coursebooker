import type { H3Event } from "h3";
import { getServerSession } from "#auth";
import type { AzureSession } from "../models/azureSession.models";

export async function getUserSession(
    event: H3Event,
): Promise<AzureSession | null> {
    return (await getServerSession(event)) as AzureSession | null;
}
