import { format } from "date-fns";
import { createEvents, type EventAttributes } from "ics";
import { createTransport, type SendMailOptions } from "nodemailer";
import type Mail from "nodemailer/lib/mailer";
import type { Course, CreateCourse, Lesson, Session } from "~~/shared/models";

export function sendRegistrationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: CreateCourse,
    session: Session,
    ics_file?: Buffer<ArrayBufferLike>,
) {
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

Vielen Dank für Deine Anmeldung zum Kurs "${course.title}".

Kursdetails:
- Name: ${course.title}
${dateStr}
- Ort: ${session.location}
${session.teams_link ? `- MS Teams Link: ${session.teams_link}` : ""}

Im Anhang findest Du eine Kalendereinladung.

Wir freuen uns auf Deine Teilnahme!

Liebe Grüsse,
DCC - Data Competence Center
dcc@bs.ch`;

    const mailOptions: SendMailOptions = {
        from: "dcc@bs.ch",
        to: userEmail,
        subject: `Anmeldung zum Kurs "${course.title}"`,
        text: body,
        attachments: [attachment],
    };

    sendMail(mailOptions);
}

export function sendUnregisterMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: CreateCourse,
    session: Session,
) {
    let dateStr = "";

    if (session.lessons.length === 1 && session.lessons[0]) {
        dateStr = `- Datum: ${format(session.lessons[0].start, "dd.MM.yyyy")}
- Uhrzeit: ${format(session.lessons[0].start, "HH:mm")} - ${format(session.lessons[0].end, "HH:mm")}`;
    } else {
    }

    // TODO handle many lessons
    const body = `Hallo ${givenName} ${familyName},

Wir haben deine Abmeldung für den Kurs "${course.title}" erhalten.

Kursdetails:
- Name: ${course.title}
${dateStr}
- Ort: ${session.location}

Liebe Grüsse,
DCC - Data Competence Center
dcc@bs.ch`;

    const mailOptions: SendMailOptions = {
        from: "dcc@bs.ch",
        to: userEmail,
        subject: `Abmeldung zum Kurs "${course.title}"`,
        text: body,
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
