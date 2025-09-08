import type { Course, CreateCourse, Lesson, Session } from "~~/shared/models";
import { format } from "date-fns";
import { createEvent } from "ics";
import { createTransport, type SendMailOptions } from "nodemailer";
import { date } from "zod";

export function sendRegistrationMail(
    familyName: string,
    givenName: string,
    userEmail: string,
    course: CreateCourse,
    session: Session,
) {
    const icss = createIcsEvents(course as Course, session);

    for (const ics of icss) {
        if (ics.error) {
            console.error("Error creating ICS event:", ics.error);
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
- MS Teams Link: ${session.teams_link}

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
        attachments: icss.map((v) => ({
            filename: `invite-${Math.random().toString(36).substring(2, 15)}.ics`,
            content: v.value,
            contentType: "text/calendar",
        })),
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
        subject: `Anmeldung zum Kurs "${course.title}"`,
        text: body,
    };

    sendMail(mailOptions);
}

function createIcsEvents(course: Course, session: Session) {
    let descriptionPostfix = "";
    if (session.teams_link) {
        descriptionPostfix += `\n\nMS Teams Meeting:: ${session.teams_link}`;
    }

    return session.lessons.map((lesson: Lesson) =>
        createEvent({
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
            url: session.teams_link ?? undefined,
        }),
    );
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
