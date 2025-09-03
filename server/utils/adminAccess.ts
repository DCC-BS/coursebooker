import type { EventHandler, EventHandlerRequest } from "h3";
import { guardAdmin } from "./admin.utils.ts";

export const defineAdminResponseHandler = <T extends EventHandlerRequest, D>(
    handler: EventHandler<T, D>,
): EventHandler<T, D> =>
    defineEventHandler<T>(async (event) => {
        await guardAdmin(event);
        const response = await handler(event);
        return response;
    });
