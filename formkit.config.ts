import { defineFormKitConfig } from "@formkit/vue";
import { rootClasses } from "./formkit.theme";
import { de } from "@formkit/i18n";

export default defineFormKitConfig({
    config: {
        rootClasses,
    },
    locale: "de",
    locales: { de },
});
