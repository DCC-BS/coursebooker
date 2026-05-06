import { format } from "date-fns";
import { createTransport, type SendMailOptions } from "nodemailer";
import de from "@/../i18n/locales/de.json";
import type {
    Course,
    CourseWithoutSessions,
    Lesson,
    Session,
} from "~~/shared/models";
import {
    createCancellationIcsAttachment,
    createIcsAttachment,
    createUpdateIcsAttachment,
} from "./ics.utils";
import { renderTemplate } from "./template.utils";

export interface SessionChanges {
    location?: { old: string | null; new: string | null };
    teams_link?: { old: string | null; new: string | null };
    lessonsAdded?: Array<{ start: Date; end: Date }>;
    lessonsUpdated?: Array<{
        id: string;
        oldStart: Date;
        oldEnd: Date;
        newStart: Date;
        newEnd: Date;
    }>;
    lessonsDeleted?: Array<{ start: Date; end: Date }>;
}

export interface CourseChanges {
    description?: { old: string | null; new: string | null };
}

export function hasChanges(changes: SessionChanges): boolean {
    return (
        changes.location !== undefined ||
        changes.teams_link !== undefined ||
        (changes.lessonsAdded !== undefined &&
            changes.lessonsAdded.length > 0) ||
        (changes.lessonsUpdated !== undefined &&
            changes.lessonsUpdated.length > 0) ||
        (changes.lessonsDeleted !== undefined &&
            changes.lessonsDeleted.length > 0)
    );
}

export function hasCourseChanges(changes: CourseChanges): boolean {
    return changes.description !== undefined;
}

export function formatChangesGerman(changes: SessionChanges): string {
    const lines: string[] = [];

    if (changes.location) {
        const oldVal = changes.location.old || "Nicht gesetzt";
        const newVal = changes.location.new || "Nicht gesetzt";
        lines.push(`- Der Ort wurde geändert: ${oldVal} → ${newVal}`);
    }

    if (changes.teams_link) {
        if (changes.teams_link.old && !changes.teams_link.new) {
            lines.push("- Der MS Teams Link wurde entfernt");
        } else if (!changes.teams_link.old && changes.teams_link.new) {
            lines.push("- Ein MS Teams Link wurde hinzugefügt");
        } else {
            lines.push("- Der MS Teams Link wurde aktualisiert");
        }
    }

    if (changes.lessonsAdded) {
        for (const lesson of changes.lessonsAdded) {
            lines.push(
                `- Neuer Termin hinzugefügt: ${format(lesson.start, "dd.MM.yyyy HH:mm")} - ${format(lesson.end, "HH:mm")}`,
            );
        }
    }

    if (changes.lessonsUpdated) {
        for (const lesson of changes.lessonsUpdated) {
            lines.push(
                `- Termin geändert: ${format(lesson.oldStart, "dd.MM.yyyy HH:mm")} → ${format(lesson.newStart, "dd.MM.yyyy HH:mm")}`,
            );
        }
    }

    if (changes.lessonsDeleted) {
        for (const lesson of changes.lessonsDeleted) {
            lines.push(
                `- Termin gelöscht: ${format(lesson.start, "dd.MM.yyyy HH:mm")} - ${format(lesson.end, "HH:mm")}`,
            );
        }
    }

    return lines.join("\n");
}

export function formatCourseChangesGerman(changes: CourseChanges): string {
    const lines: string[] = [];

    if (changes.description) {
        lines.push("- Die Beschreibung wurde aktualisiert");
    }

    return lines.join("\n");
}

function formatDateStr(lessons: Lesson[]): string {
    if (lessons.length === 1 && lessons[0]) {
        return format(lessons[0].start, "dd.MM.yyyy");
    }
    return lessons
        .map(
            (l, i) =>
                `${i + 1}. ${format(l.start, "dd.MM.yyyy")} ${format(l.start, "HH:mm")} - ${format(l.end, "HH:mm")}`,
        )
        .join("\n");
}

function formatTimeStr(lessons: Lesson[]): string | null {
    if (lessons.length === 1 && lessons[0]) {
        return `${format(lessons[0].start, "HH:mm")} - ${format(lessons[0].end, "HH:mm")}`;
    }
    return null;
}

function buildCourseContext(
    givenName: string,
    familyName: string,
    course: CourseWithoutSessions | Omit<Course, "sessions">,
    session: Session,
    extras?: Record<string, unknown>,
): Record<string, unknown> {
    const config = useRuntimeConfig();

    return {
        givenName,
        familyName,
        courseTitle: course.title,
        courseTypeLabel:
            course.type === "course"
                ? de.courseDetails.course
                : de.courseDetails.event,
        dateStr: formatDateStr(session.lessons),
        timeStr: formatTimeStr(session.lessons),
        isSingleLesson: session.lessons.length === 1,
        location: session.location ?? "Nicht bekannt",
        teamsLink: session.teams_link ?? null,
        siteUrl: config.siteUrl,
        courseId: course.id,
        sessionId: session.id,
        organizerName: course.organizer_name,
        organizerMail: course.organizer_mail,
        ...extras,
    };
}

function typeLabel(type: string): string {
    return type === "course" ? de.courseDetails.course : de.courseDetails.event;
}

export async function sendRegistrationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: Omit<Course, "sessions">,
    session: Session,
    ics_file?: Buffer<ArrayBufferLike>,
): Promise<boolean> {
    const attachment = ics_file
        ? {
              filename: `invite-${Math.random().toString(36).substring(2, 15)}.ics`,
              contentType: "text/calendar",
              content: ics_file,
          }
        : createIcsAttachment(course, session);

    const context = buildCourseContext(givenName, familyName, course, session, {
        hasIcsAttachment: true,
    });

    const { html, text } = renderTemplate("registration", context);

    const mailOptions: SendMailOptions = {
        from: useRuntimeConfig().mailFrom,
        to: userEmail,
        subject: `Anmeldung zum ${typeLabel(course.type)} "${course.title}"`,
        html,
        text,
        attachments: [attachment],
    };

    console.log("Sending registration email:", mailOptions);

    return sendMail(mailOptions);
}

export async function sendUnregisterMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: Omit<Course, "sessions">,
    session: Session,
): Promise<boolean> {
    const context = buildCourseContext(givenName, familyName, course, session);

    const { html, text } = renderTemplate("unregister", context);

    const mailOptions: SendMailOptions = {
        from: useRuntimeConfig().mailFrom,
        to: userEmail,
        subject: `Abmeldung zum ${typeLabel(course.type)} "${course.title}"`,
        html,
        text,
    };

    return sendMail(mailOptions);
}

export async function sendCancellationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: CourseWithoutSessions,
    session: Session,
): Promise<boolean> {
    const attachment = await createCancellationIcsAttachment(course, session);

    const context = buildCourseContext(givenName, familyName, course, session);

    const { html, text } = renderTemplate("cancellation", context);

    const mailOptions: SendMailOptions = {
        from: useRuntimeConfig().mailFrom,
        to: userEmail,
        subject: `Absage: ${typeLabel(course.type)} "${course.title}"`,
        html,
        text,
        attachments: [attachment],
    };

    return sendMail(mailOptions);
}

const sharedTransporter = createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    pool: true,
    maxConnections: 5,
    rateLimit: 10,
});

async function sendMail(mailOptions: SendMailOptions): Promise<boolean> {
    try {
        const info = await sharedTransporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
        return true;
    } catch (error: unknown) {
        console.error("Error sending email:", error);
        return false;
    }
}

export function buildCustomNotificationMailContent(
    givenName: string,
    familyName: string,
    course: CourseWithoutSessions,
    session: Session,
    customMessage: string,
    hasIcsAttached: boolean,
): { subject: string; body: string } {
    const context = buildCourseContext(givenName, familyName, course, session, {
        customMessage,
        hasIcsAttachment: hasIcsAttached,
    });

    const { text } = renderTemplate("custom-notification", context);

    return {
        subject: `Update: ${typeLabel(course.type)} "${course.title}"`,
        body: text,
    };
}

export async function sendCustomNotificationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: CourseWithoutSessions,
    session: Session,
    customMessage: string,
    sequence: number,
    attachIcs: boolean,
): Promise<boolean> {
    const attachments = [];

    if (attachIcs) {
        attachments.push(createUpdateIcsAttachment(course, session, sequence));
    }

    const context = buildCourseContext(givenName, familyName, course, session, {
        customMessage,
        hasIcsAttachment: attachIcs,
    });

    const { html, text } = renderTemplate("custom-notification", context);

    const mailOptions: SendMailOptions = {
        from: useRuntimeConfig().mailFrom,
        to: userEmail,
        subject: `Update: ${typeLabel(course.type)} "${course.title}"`,
        html,
        text,
        attachments,
    };

    return sendMail(mailOptions);
}

export function generateIcsAttachment(
    course: CourseWithoutSessions,
    session: Session,
    sequence: number,
): Buffer | null {
    const icss = createUpdateIcsAttachment(course, session, sequence);
    if (typeof icss.content === "string") {
        return Buffer.from(icss.content);
    }
    if (Buffer.isBuffer(icss.content)) {
        return icss.content;
    }
    return null;
}
