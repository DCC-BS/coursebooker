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

export function sendRegistrationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: Course,
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
    course: Course,
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

export function sendCancellationMail(
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

    const icss = createCancellationIcsEvents(course, session);
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

function createIcsEvents(course: Course, session: Session): EventAttributes[] {
    let descriptionPostfix = "";

    let teams_link: string | undefined;
    if (session.teams_link && session.teams_link.length > 0) {
        teams_link = session.teams_link;
    }

    if (teams_link) {
        descriptionPostfix += `\n\nMS Teams Meeting:: ${session.teams_link}`;
    }

    return session.lessons.map((lesson: Lesson) => ({
        uid: course.id,
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

function createCancellationIcsEvents(
    course: CourseWithoutSessions,
    session: Session,
): EventAttributes[] {
    let descriptionPostfix = "";

    let teams_link: string | undefined;
    if (session.teams_link && session.teams_link.length > 0) {
        teams_link = session.teams_link;
    }

    if (teams_link) {
        descriptionPostfix += `\n\nMS Teams Meeting:: ${session.teams_link}`;
    }

    return session.lessons.map((lesson: Lesson) => ({
        uid: course.id,
        lastModified: Date.now(),
        sequence: 2,
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
