import Handlebars from "handlebars";
import { cancellationHtml, cancellationText } from "../templates/cancellation";
import {
    customNotificationHtml,
    customNotificationText,
} from "../templates/custom-notification";
import {
    courseDetailsHtml,
    courseDetailsText,
    signatureHtml,
    signatureText,
} from "../templates/partials/course-details";
import { registrationHtml, registrationText } from "../templates/registration";
import { unregisterHtml, unregisterText } from "../templates/unregister";

type TemplateName =
    | "registration"
    | "unregister"
    | "cancellation"
    | "custom-notification";

const templateSources: Record<TemplateName, { html: string; text: string }> = {
    registration: { html: registrationHtml, text: registrationText },
    unregister: { html: unregisterHtml, text: unregisterText },
    cancellation: { html: cancellationHtml, text: cancellationText },
    "custom-notification": {
        html: customNotificationHtml,
        text: customNotificationText,
    },
};

const compiledTemplates = new Map<string, Handlebars.TemplateDelegate>();

function registerPartials() {
    Handlebars.registerPartial("courseDetailsHtml", courseDetailsHtml);
    Handlebars.registerPartial("courseDetailsText", courseDetailsText);
    Handlebars.registerPartial("signatureHtml", signatureHtml);
    Handlebars.registerPartial("signatureText", signatureText);
}

function getCompiled(
    templateName: TemplateName,
    variant: "html" | "text",
): Handlebars.TemplateDelegate {
    const key = `${templateName}.${variant}`;

    if (!compiledTemplates.has(key)) {
        const source = templateSources[templateName][variant];
        compiledTemplates.set(key, Handlebars.compile(source));
    }

    const template = compiledTemplates.get(key);
    if (!template) {
        throw new Error(`Template not found: ${key}`);
    }
    return template;
}

let initialized = false;

function ensureInitialized() {
    if (!initialized) {
        registerPartials();
        initialized = true;
    }
}

export function renderTemplate(
    templateName: TemplateName,
    context: Record<string, unknown>,
): { html: string; text: string } {
    ensureInitialized();

    const html = getCompiled(templateName, "html")(context);
    const text = getCompiled(templateName, "text")(context);

    return { html, text };
}
