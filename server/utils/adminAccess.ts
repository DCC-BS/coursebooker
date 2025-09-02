import type { EventHandler, EventHandlerRequest } from "h3";
import { guardAdmin } from "./admin.utils.ts";

export const defineAdminResponseHandler = <T extends EventHandlerRequest, D>(
    handler: EventHandler<T, D>,
): EventHandler<T, D> =>
    defineEventHandler<T>(async (event) => {
        try {
            await guardAdmin(event);
            const response = await handler(event);
            return { response };
        } catch (err) {
            // Error handling
            return { err };
        }
    });
