import { createEvents, type EventAttributes } from "ics";
import type Mail from "nodemailer/lib/mailer";
import type { CourseWithoutSessions, Lesson, Session } from "~~/shared/models";
import { getCurrentVersionNumber } from "./icsVersion.utils";

type IcsMode = "create" | "update" | "cancel";

interface IcsOptions {
    mode: IcsMode;
    sequence?: number;
}

function buildLessonTimes(lesson: Lesson) {
    return {
        start: [
            lesson.start.getFullYear(),
            lesson.start.getMonth() + 1,
            lesson.start.getDate(),
            lesson.start.getHours(),
            lesson.start.getMinutes(),
        ] as [number, number, number, number, number],
        end: [
            lesson.end.getFullYear(),
            lesson.end.getMonth() + 1,
            lesson.end.getDate(),
            lesson.end.getHours(),
            lesson.end.getMinutes(),
        ] as [number, number, number, number, number],
    };
}

function buildIcsEvents(
    course: CourseWithoutSessions,
    session: Session,
    options: IcsOptions,
): EventAttributes[] {
    const { mode, sequence } = options;

    let descriptionPostfix = "";
    const teams_link =
        session.teams_link && session.teams_link.length > 0
            ? session.teams_link.trim()
            : undefined;

    if (teams_link) {
        descriptionPostfix += `\n\nMS Teams Meeting:: ${teams_link}`;
    }

    const isCancel = mode === "cancel";
    const title = isCancel ? `CANCELLED: ${course.title}` : course.title;
    const description = isCancel
        ? `ABGESAGT\n\n${course.description}${descriptionPostfix}`
        : course.description + descriptionPostfix;

    return session.lessons.map((lesson: Lesson) => {
        const { start, end } = buildLessonTimes(lesson);
        const event: EventAttributes = {
            uid: `${course.id}-${session.id}-${lesson.id}`,
            title,
            description,
            start,
            end,
            organizer: {
                name: course.organizer_name,
                email: course.organizer_mail,
            },
            location: session.location ?? undefined,
            url: teams_link,
        };

        if (isCancel || mode === "update") {
            event.lastModified = Date.now();
        }

        if (sequence !== undefined) {
            event.sequence = sequence;
        }

        if (isCancel) {
            event.status = "CANCELLED";
        }

        return event;
    });
}

export function createIcsAttachment(
    course: CourseWithoutSessions,
    session: Session,
    options: IcsOptions = { mode: "create" },
): Mail.Attachment {
    const events = buildIcsEvents(course, session, options);
    const ics = createEvents(events);

    const prefix =
        options.mode === "cancel"
            ? "cancellation"
            : options.mode === "update"
              ? "update"
              : "invite";

    const attachment: Mail.Attachment = {
        filename: `${prefix}-${Math.random().toString(36).substring(2, 15)}.ics`,
        contentType: "text/calendar",
    };

    if (ics.error || !ics.value) {
        throw (
            ics.error ??
            new Error("Failed to create ICS event: no value returned")
        );
    }

    attachment.content = ics.value;

    return attachment;
}

export async function createCancellationIcsAttachment(
    course: CourseWithoutSessions,
    session: Session,
): Promise<Mail.Attachment> {
    const currentVersion = await getCurrentVersionNumber(session.id);
    const sequence = currentVersion + 1;

    return createIcsAttachment(course, session, {
        mode: "cancel",
        sequence,
    });
}

export function createUpdateIcsAttachment(
    course: CourseWithoutSessions,
    session: Session,
    sequence: number,
): Mail.Attachment {
    return createIcsAttachment(course, session, { mode: "update", sequence });
}

export function generateIcsBuffer(
    course: CourseWithoutSessions,
    session: Session,
    sequence: number,
): Buffer | null {
    const events = buildIcsEvents(course, session, {
        mode: "update",
        sequence,
    });
    const ics = createEvents(events);

    if (ics.error) {
        console.error("Error creating ICS events:", ics.error);
        return null;
    }

    return Buffer.from(ics.value as string);
}
