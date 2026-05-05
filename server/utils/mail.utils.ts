import { format } from "date-fns";
import { createEvents, type EventAttributes } from "ics";
import { createTransport, type SendMailOptions } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import de from "@/../i18n/locales/de.json";
import type {
    Course,
    CourseWithoutSessions,
    Lesson,
    Session,
} from "~~/shared/models";
import { getCurrentVersion, getCurrentVersionNumber } from "./icsVersion.utils";

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

export function sendRegistrationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: Omit<Course, "sessions">,
    session: Session,
    ics_file?: Buffer<ArrayBufferLike>,
) {
    const config = useRuntimeConfig();
    const siteUrl = config.siteUrl;

    const attachment = {
        filename: `invite-${Math.random().toString(36).substring(2, 15)}.ics`,
        contentType: "text/calendar",
    } as Mail.Attachment;

    if (ics_file) {
        attachment.content = ics_file;
    } else {
        const icss = createIcsEvents(course as Course, session);
        const ics = createEvents(icss);
        if (ics.error) {
            console.error("Error creating ICS event:", ics.error);
        } else {
            attachment.content = ics.value;
        }
    }

    let dateStr = "";
    const type =
        course.type === "course"
            ? de.courseDetails.course
            : de.courseDetails.event;

    if (session.lessons.length === 1 && session.lessons[0]) {
        dateStr = `- Datum: ${format(session.lessons[0].start, "dd.MM.yyyy")}
- Uhrzeit: ${format(session.lessons[0].start, "HH:mm")} - ${format(session.lessons[0].end, "HH:mm")}`;
    } else {
        dateStr = session.lessons
            .map((lesson, index) => {
                return `  ${index + 1}. ${format(lesson.start, "dd.MM.yyyy")} ${format(
                    lesson.start,
                    "HH:mm",
                )} - ${format(lesson.end, "HH:mm")}`;
            })
            .join("\n");
        dateStr = `- Daten:\n${dateStr}`;
    }

    const body = `Hallo ${givenName} ${familyName},

Vielen Dank für Deine Anmeldung zum ${type} "${course.title}".

${type}details:
- Name: ${course.title}
${dateStr}
- Ort: ${session.location ?? "Nicht bekannt"}
${session.teams_link ? `- MS Teams Link: ${session.teams_link}` : ""}

Du kannst an dem Termin doch nicht teilnehmen oder hast dich irrtümlicherweise angemeldet? Über diesen Link kannst du dich wieder vom Event abmelden:
${siteUrl}/courses/${course.id}/${session.id}

Im Anhang findest Du eine Kalendereinladung.

Wir freuen uns auf Deine Teilnahme!

Liebe Grüsse,
DCC - Data Competence Center
dcc@bs.ch`;

    const mailOptions: SendMailOptions = {
        from: "dcc@bs.ch",
        to: userEmail,
        subject: `Anmeldung zum ${type} "${course.title}"`,
        text: body,
        attachments: [attachment],
    };

    console.log("Sending registration email:", mailOptions);

    sendMail(mailOptions);
}

export function sendUnregisterMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: Omit<Course, "sessions">,
    session: Session,
) {
    let dateStr = "";
    const type =
        course.type === "course"
            ? de.courseDetails.course
            : de.courseDetails.event;

    if (session.lessons.length === 1 && session.lessons[0]) {
        dateStr = `- Datum: ${format(session.lessons[0].start, "dd.MM.yyyy")}
- Uhrzeit: ${format(session.lessons[0].start, "HH:mm")} - ${format(session.lessons[0].end, "HH:mm")}`;
    } else {
    }

    // TODO handle many lessons
    const body = `Hallo ${givenName} ${familyName},

Wir haben deine Abmeldung für den ${type} "${course.title}" erhalten.

${type}details:
- Name: ${course.title}
${dateStr}
- Ort: ${session.location}

Liebe Grüsse,
DCC - Data Competence Center
dcc@bs.ch`;

    const mailOptions: SendMailOptions = {
        from: "dcc@bs.ch",
        to: userEmail,
        subject: `Abmeldung zum ${type} "${course.title}"`,
        text: body,
    };

    sendMail(mailOptions);
}

export async function sendCancellationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: CourseWithoutSessions,
    session: Session,
) {
    let dateStr = "";
    const type =
        course.type === "course"
            ? de.courseDetails.course
            : de.courseDetails.event;

    if (session.lessons.length === 1 && session.lessons[0]) {
        dateStr = `- Datum: ${format(session.lessons[0].start, "dd.MM.yyyy")}
- Uhrzeit: ${format(session.lessons[0].start, "HH:mm")} - ${format(session.lessons[0].end, "HH:mm")}`;
    } else {
        dateStr = session.lessons
            .map((lesson, index) => {
                return `  ${index + 1}. ${format(lesson.start, "dd.MM.yyyy")} ${format(
                    lesson.start,
                    "HH:mm",
                )} - ${format(lesson.end, "HH:mm")}`;
            })
            .join("\n");
        dateStr = `- Daten:\n${dateStr}`;
    }

    const attachment = {
        filename: `cancellation-${Math.random().toString(36).substring(2, 15)}.ics`,
        contentType: "text/calendar",
    } as Mail.Attachment;

    const icss = await createCancellationIcsEvents(course, session);
    const ics = createEvents(icss);
    if (ics.error) {
        console.error("Error creating cancellation ICS event:", ics.error);
    } else {
        attachment.content = ics.value;
    }

    const body = `Hallo ${givenName} ${familyName},

Leider wurde der ${type} "${course.title}" abgesagt.

${type}details:
- Name: ${course.title}
${dateStr}
- Ort: ${session.location ?? "Nicht bekannt"}

Wir bitten um Entschuldigung für die Umstände.

Liebe Grüsse,
DCC - Data Competence Center
dcc@bs.ch`;

    const mailOptions: SendMailOptions = {
        from: "dcc@bs.ch",
        to: userEmail,
        subject: `Absage: ${type} "${course.title}"`,
        text: body,
        attachments: [attachment],
    };

    sendMail(mailOptions);
}

// export function sendSessionUpdateMail(
//     familyName: string,
//     givenName: string,
//     userEmail: string,
//     course: CourseWithoutSessions,
//     session: Session,
//     changes: SessionChanges,
// ) {
//     const config = useRuntimeConfig();
//     const siteUrl = config.siteUrl;

//     let dateStr = "";
//     const type =
//         course.type === "course"
//             ? de.courseDetails.course
//             : de.courseDetails.event;

//     if (session.lessons.length === 1 && session.lessons[0]) {
//         dateStr = `- Datum: ${format(session.lessons[0].start, "dd.MM.yyyy")}
// - Uhrzeit: ${format(session.lessons[0].start, "HH:mm")} - ${format(session.lessons[0].end, "HH:mm")}`;
//     } else {
//         dateStr = session.lessons
//             .map((lesson, index) => {
//                 return `  ${index + 1}. ${format(lesson.start, "dd.MM.yyyy")} ${format(
//                     lesson.start,
//                     "HH:mm",
//                 )} - ${format(lesson.end, "HH:mm")}`;
//             })
//             .join("\n");
//         dateStr = `- Daten:\n${dateStr}`;
//     }

//     const changesText = formatChangesGerman(changes);

//     const attachment = {
//         filename: `update-${Math.random().toString(36).substring(2, 15)}.ics`,
//         contentType: "text/calendar",
//     } as Mail.Attachment;

//     const currentVersion = await getCurrentVersion(session.id);
//     const sequence = session.sequence ?? 0;
//     const icss = createUpdateIcsEvents(course, session, sequence);
//     const ics = createEvents(icss);
//     if (ics.error) {
//         console.error("Error creating update ICS event:", ics.error);
//     } else {
//         attachment.content = ics.value;
//     }

//     const body = `Hallo ${givenName} ${familyName},

// Der ${type} "${course.title}" wurde aktualisiert.

// Änderungen:
// ${changesText}

// Aktuelle ${type}details:
// - Name: ${course.title}
// ${dateStr}
// - Ort: ${session.location ?? "Nicht bekannt"}
// ${session.teams_link ? `- MS Teams Link: ${session.teams_link}` : ""}

// Du kannst den Termin hier einsehen oder dich abmelden:
// ${siteUrl}/courses/${course.id}/${session.id}

// Im Anhang findest Du die aktualisierte Kalendereinladung.

// Liebe Grüsse,
// DCC - Data Competence Center
// dcc@bs.ch`;

//     const mailOptions: SendMailOptions = {
//         from: "dcc@bs.ch",
//         to: userEmail,
//         subject: `Aktualisierung: ${type} "${course.title}"`,
//         text: body,
//         attachments: [attachment],
//     };

//     sendMail(mailOptions);
// }

export async function sendCourseUpdateMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: Course,
    sessions: Session[],
    changes: CourseChanges,
) {
    const config = useRuntimeConfig();
    const siteUrl = config.siteUrl;

    const type =
        course.type === "course"
            ? de.courseDetails.course
            : de.courseDetails.event;

    const changesText = formatCourseChangesGerman(changes);

    const attachments: Mail.Attachment[] = [];

    for (const session of sessions) {
        const currentVersion = await getCurrentVersionNumber(session.id);
        const sequence = currentVersion + 1;
        const icss = createUpdateIcsEvents(course, session, sequence);
        const ics = createEvents(icss);
        if (ics.error) {
            console.error("Error creating course update ICS event:", ics.error);
        } else {
            attachments.push({
                filename: `update-${course.id}-${session.id}.ics`,
                content: ics.value,
                contentType: "text/calendar",
            });
        }
    }

    const sessionLinks = sessions
        .map(
            (session, index) =>
                `  ${index + 1}. ${siteUrl}/courses/${course.id}/${session.id}`,
        )
        .join("\n");

    const body = `Hallo ${givenName} ${familyName},

Der ${type} "${course.title}" wurde aktualisiert.

Änderungen:
${changesText}

Aktuelle ${type}details:
- Name: ${course.title}
- Beschreibung: ${course.description}

Du kannst die Sessions hier einsehen oder dich abmelden:
${sessionLinks}

Im Anhang findest Du die aktualisierten Kalendereinladungen für deine angemeldeten Sessions.

Liebe Grüsse,
DCC - Data Competence Center
dcc@bs.ch`;

    const mailOptions: SendMailOptions = {
        from: "dcc@bs.ch",
        to: userEmail,
        subject: `Aktualisierung: ${type} "${course.title}"`,
        text: body,
        attachments,
    };

    sendMail(mailOptions);
}

function createIcsEvents(course: Course, session: Session): EventAttributes[] {
    let descriptionPostfix = "";

    let teams_link: string | undefined;
    if (session.teams_link && session.teams_link.length > 0) {
        teams_link = session.teams_link;
    }

    if (teams_link) {
        descriptionPostfix += `\n\nMS Teams Meeting:: ${session.teams_link}`;
    }

    const now = new Date();
    const dtstamp = [
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
    ] as [number, number, number, number, number];

    return session.lessons.map((lesson: Lesson) => ({
        uid: `${course.id}-${session.id}-${lesson.id}`,
        title: course.title,
        description: course.description + descriptionPostfix,
        start: [
            lesson.start.getFullYear(),
            lesson.start.getMonth() + 1,
            lesson.start.getDate(),
            lesson.start.getHours(),
            lesson.start.getMinutes(),
        ],
        end: [
            lesson.end.getFullYear(),
            lesson.end.getMonth() + 1,
            lesson.end.getDate(),
            lesson.end.getHours(),
            lesson.end.getMinutes(),
        ],
        dtstamp,
        organizer: {
            name: course.organizer_name,
            email: course.organizer_mail,
        },
        location: session.location ?? undefined,
        url: teams_link,
    }));
}

async function createCancellationIcsEvents(
    course: CourseWithoutSessions,
    session: Session,
): Promise<EventAttributes[]> {
    let descriptionPostfix = "";

    let teams_link: string | undefined;
    if (session.teams_link && session.teams_link.length > 0) {
        teams_link = session.teams_link;
    }

    if (teams_link) {
        descriptionPostfix += `\n\nMS Teams Meeting:: ${session.teams_link}`;
    }

    const now = new Date();
    const dtstamp = [
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
    ] as [number, number, number, number, number];

    const currentVersion = await getCurrentVersionNumber(session.id);
    const sequence = currentVersion + 1;

    return session.lessons.map((lesson: Lesson) => ({
        uid: `${course.id}-${session.id}-${lesson.id}`,
        lastModified: Date.now(),
        dtstamp,
        sequence,
        title: `CANCELLED: ${course.title}`,
        description: `ABGESAGT\n\n${course.description}${descriptionPostfix}`,
        start: [
            lesson.start.getFullYear(),
            lesson.start.getMonth() + 1,
            lesson.start.getDate(),
            lesson.start.getHours(),
            lesson.start.getMinutes(),
        ],
        end: [
            lesson.end.getFullYear(),
            lesson.end.getMonth() + 1,
            lesson.end.getDate(),
            lesson.end.getHours(),
            lesson.end.getMinutes(),
        ],
        status: "CANCELLED",
        organizer: {
            name: course.organizer_name,
            email: course.organizer_mail,
        },
        location: session.location ?? undefined,
        url: teams_link,
    }));
}

function createUpdateIcsEvents(
    course: CourseWithoutSessions,
    session: Session,
    sequence: number,
): EventAttributes[] {
    let descriptionPostfix = "";

    let teams_link: string | undefined;
    if (session.teams_link && session.teams_link.length > 0) {
        teams_link = session.teams_link;
    }

    if (teams_link) {
        descriptionPostfix += `\n\nMS Teams Meeting:: ${session.teams_link}`;
    }

    const now = new Date();
    const dtstamp = [
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate(),
        now.getHours(),
        now.getMinutes(),
    ] as [number, number, number, number, number];

    return session.lessons.map((lesson: Lesson) => ({
        uid: `${course.id}-${session.id}-${lesson.id}`,
        lastModified: Date.now(),
        dtstamp,
        sequence,
        title: course.title,
        description: course.description + descriptionPostfix,
        start: [
            lesson.start.getFullYear(),
            lesson.start.getMonth() + 1,
            lesson.start.getDate(),
            lesson.start.getHours(),
            lesson.start.getMinutes(),
        ],
        end: [
            lesson.end.getFullYear(),
            lesson.end.getMonth() + 1,
            lesson.end.getDate(),
            lesson.end.getHours(),
            lesson.end.getMinutes(),
        ],
        organizer: {
            name: course.organizer_name,
            email: course.organizer_mail,
        },
        location: session.location ?? undefined,
        url: teams_link,
    }));
}

function sendMail(mailOptions: SendMailOptions) {
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
    });

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error("Error sending email:", error);
        } else {
            console.log("Email sent:", info.response);
        }
    });
}

export function buildCustomNotificationMailContent(
    givenName: string,
    familyName: string,
    course: CourseWithoutSessions,
    session: Session,
    customMessage: string,
): { subject: string; body: string } {
    const config = useRuntimeConfig();
    const siteUrl = config.siteUrl;

    const type =
        course.type === "course"
            ? de.courseDetails.course
            : de.courseDetails.event;

    let dateStr = "";
    if (session.lessons.length === 1 && session.lessons[0]) {
        dateStr = `- Datum: ${format(session.lessons[0].start, "dd.MM.yyyy")}
- Uhrzeit: ${format(session.lessons[0].start, "HH:mm")} - ${format(session.lessons[0].end, "HH:mm")}`;
    } else {
        dateStr = session.lessons
            .map((lesson, index) => {
                return `  ${index + 1}. ${format(lesson.start, "dd.MM.yyyy")} ${format(lesson.start, "HH:mm")} - ${format(lesson.end, "HH:mm")}`;
            })
            .join("\n");
        dateStr = `- Daten:\n${dateStr}`;
    }

    const body = `Hallo ${givenName} ${familyName},

${customMessage}

${type}details:
- Name: ${course.title}
${dateStr}
- Ort: ${session.location ?? "Nicht bekannt"}
${session.teams_link ? `- MS Teams Link: ${session.teams_link}` : ""}

Du kannst den Termin hier einsehen oder dich abmelden:
${siteUrl}/courses/${course.id}/${session.id}

Im Anhang findest Du die aktualisierte Kalendereinladung.

Liebe Grüsse,
DCC - Data Competence Center
dcc@bs.ch`;

    return {
        subject: `Update: ${type} "${course.title}"`,
        body,
    };
}

export function sendCustomNotificationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: CourseWithoutSessions,
    session: Session,
    customMessage: string,
    sequence: number,
) {
    const icss = createUpdateIcsEvents(course, session, sequence);
    const ics = createEvents(icss);

    const attachment: Mail.Attachment = {
        filename: `update-${course.id}-${session.id}.ics`,
        contentType: "text/calendar",
    };

    if (ics.error) {
        console.error(
            "Error creating custom notification ICS event:",
            ics.error,
        );
    } else {
        attachment.content = ics.value;
    }

    const { subject, body } = buildCustomNotificationMailContent(
        givenName,
        familyName,
        course,
        session,
        customMessage,
    );

    const mailOptions: SendMailOptions = {
        from: "dcc@bs.ch",
        to: userEmail,
        subject,
        text: body,
        attachments: [attachment],
    };

    sendMail(mailOptions);
}

export function generateIcsAttachment(
    course: CourseWithoutSessions,
    session: Session,
    sequence: number,
): Buffer | null {
    const icss = createUpdateIcsEvents(course, session, sequence);
    const ics = createEvents(icss);

    if (ics.error) {
        console.error("Error creating ICS events:", ics.error);
        return null;
    }

    return Buffer.from(ics.value as string);
}
