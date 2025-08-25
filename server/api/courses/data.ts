import type { Course, CoursesData } from "../../../shared/models/courses.model";

// In-memory storage for demo purposes
// In a real application, this would be replaced with a database
const coursesData: CoursesData = {
    courses: [
        {
            id: "wissensaustausch-data-science-ki-2025-10-23",
            type: "course",
            title: "Wissensaustausch Data Science & KI",
            description:
                "Die Veranstaltung soll den Austausch zu Datenwissenschaft und KI im Kanton Basel fördern. Kern der Veranstaltung sind Vorträge aus verschiedenen Bereichen der Verwaltung. Ein detailliertes Programm folgt.",
            teams_link: "",
            organizer_name: "DCC Basel-Stadt",
            organizer_mail: "dcc@bs.ch",
            sessions: [
                {
                    id: "session-1",
                    location: "Wird noch bekanntgegeben",
                    teams_link: "",
                    lessons: [
                        {
                            id: "lesson-1",
                            start: new Date("2025-10-23T15:30:00"),
                            end: new Date("2025-10-23T17:30:00"),
                        },
                    ],
                },
            ],
        },
        {
            id: "wissensaustausch-data-science-ki-2026-02-12",
            type: "course",
            title: "Wissensaustausch Data Science & KI",
            description:
                "Die Veranstaltung soll den Austausch zu Datenwissenschaft und KI im Kanton Basel fördern. Kern der Veranstaltung sind Vorträge aus verschiedenen Bereichen der Verwaltung. Ein detailliertes Programm folgt.",
            teams_link: "",
            organizer_name: "DCC Basel-Stadt",
            organizer_mail: "dcc@bs.ch",
            sessions: [
                {
                    id: "session-1",
                    location: "Wird noch bekanntgegeben",
                    teams_link: "",
                    lessons: [
                        {
                            id: "lesson-1",
                            start: new Date("2026-02-12T15:30:00"),
                            end: new Date("2026-02-12T17:30:00"),
                        },
                    ],
                },
            ],
        },
        {
            id: "wissensaustausch-data-science-ki-2026-06-18",
            type: "course",
            title: "Wissensaustausch Data Science & KI",
            description:
                "Die Veranstaltung soll den Austausch zu Datenwissenschaft und KI im Kanton Basel fördern. Kern der Veranstaltung sind Vorträge aus verschiedenen Bereichen der Verwaltung. Ein detailliertes Programm folgt.",
            teams_link: "",
            organizer_name: "DCC Basel-Stadt",
            organizer_mail: "dcc@bs.ch",
            sessions: [
                {
                    id: "session-1",
                    location: "Wird noch bekanntgegeben",
                    teams_link: "",
                    lessons: [
                        {
                            id: "lesson-1",
                            start: new Date("2026-06-18T15:30:00"),
                            end: new Date("2026-06-18T17:30:00"),
                        },
                    ],
                },
            ],
        },
        {
            id: "wissensaustausch-data-science-ki-2026-10-22",
            type: "course",
            title: "Wissensaustausch Data Science & KI",
            description:
                "Die Veranstaltung soll den Austausch zu Datenwissenschaft und KI im Kanton Basel fördern. Kern der Veranstaltung sind Vorträge aus verschiedenen Bereichen der Verwaltung. Ein detailliertes Programm folgt.",
            teams_link: "",
            organizer_name: "DCC Basel-Stadt",
            organizer_mail: "dcc@bs.ch",
            sessions: [
                {
                    id: "session-1",
                    location: "Wird noch bekanntgegeben",
                    teams_link: "",
                    lessons: [
                        {
                            id: "lesson-1",
                            start: new Date("2026-10-22T15:30:00"),
                            end: new Date("2026-10-22T17:30:00"),
                        },
                    ],
                },
            ],
        },
        {
            id: "einfuehrung-dcc-ki-pilotanwendungen-2025-08-19",
            type: "event",
            title: "Einführung DCC KI Pilotanwendungen",
            description:
                "In 30 Minuten geben wir eine Einführung zu den neuen kantonalen KI Pilot Tools. Wir gehen dabei auf folgende Fragen ein: Wie kann ich die Tools verwenden, was muss ich beachten und wie steht es um den Datenschutz?",
            teams_link:
                "https://teams.microsoft.com/l/meetup-join/19%3ameeting_NTFmNGRkZmUtOTQ5MC00ODg2LWJlODYtM2RiMGY0ZjkwMjcy%40thread.v2/0?context=%7b%22Tid%22%3a%2211172f95-a39a-4f7b-9224-c6a11d1e5c24%22%2c%22Oid%22%3a%22b702716c-e2e6-4c9e-8b9b-ea88ef3f3f0a%22%7d",
            organizer_name: "DCC Basel-Stadt",
            organizer_mail: "dcc@bs.ch",
            sessions: [
                {
                    id: "session-1",
                    location: "Microsoft Teams",
                    teams_link:
                        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_NTFmNGRkZmUtOTQ5MC00ODg2LWJlODYtM2RiMGY0ZjkwMjcy%40thread.v2/0?context=%7b%22Tid%22%3a%2211172f95-a39a-4f7b-9224-c6a11d1e5c24%22%2c%22Oid%22%3a%22b702716c-e2e6-4c9e-8b9b-ea88ef3f3f0a%22%7d",
                    lessons: [
                        {
                            id: "lesson-1",
                            start: new Date("2025-08-19T13:30:00"),
                            end: new Date("2025-08-19T14:00:00"),
                        },
                    ],
                },
            ],
        },
        {
            id: "einfuehrung-dcc-ki-pilotanwendungen-2025-08-22",
            type: "event",
            title: "Einführung DCC KI Pilotanwendungen",
            description:
                "In 30 Minuten geben wir eine Einführung zu den neuen kantonalen KI Pilot Tools. Wir gehen dabei auf folgende Fragen ein: Wie kann ich die Tools verwenden, was muss ich beachten und wie steht es um den Datenschutz?",
            teams_link:
                "https://teams.microsoft.com/l/meetup-join/19%3ameeting_YzE4NGFhYTctZmI5Zi00M2M1LWJhMzQtYTI5N2VkMWM3Y2Y4%40thread.v2/0?context=%7b%22Tid%22%3a%2211172f95-a39a-4f7b-9224-c6a11d1e5c24%22%2c%22Oid%22%3a%22b702716c-e2e6-4c9e-8b9b-ea88ef3f3f0a%22%7d",
            organizer_name: "DCC Basel-Stadt",
            organizer_mail: "dcc@bs.ch",
            sessions: [
                {
                    id: "session-1",
                    location: "Microsoft Teams",
                    teams_link:
                        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_YzE4NGFhYTctZmI5Zi00M2M1LWJhMzQtYTI5N2VkMWM3Y2Y4%40thread.v2/0?context=%7b%22Tid%22%3a%2211172f95-a39a-4f7b-9224-c6a11d1e5c24%22%2c%22Oid%22%3a%22b702716c-e2e6-4c9e-8b9b-ea88ef3f3f0a%22%7d",
                    lessons: [
                        {
                            id: "lesson-1",
                            start: new Date("2025-08-22T09:00:00"),
                            end: new Date("2025-08-22T09:30:00"),
                        },
                    ],
                },
            ],
        },
        {
            id: "einfuehrung-dcc-ki-pilotanwendungen-2025-08-27",
            type: "event",
            title: "Einführung DCC KI Pilotanwendungen",
            description:
                "In 30 Minuten geben wir eine Einführung zu den neuen kantonalen KI Pilot Tools. Wir gehen dabei auf folgende Fragen ein: Wie kann ich die Tools verwenden, was muss ich beachten und wie steht es um den Datenschutz?",
            teams_link:
                "https://teams.microsoft.com/l/meetup-join/19%3ameeting_NDg2YjUxYmItOTg3Yy00ZjY3LTgyZDgtNmY2NTIyNDE1NTI3%40thread.v2/0?context=%7b%22Tid%22%3a%2211172f95-a39a-4f7b-9224-c6a11d1e5c24%22%2c%22Oid%22%3a%22b702716c-e2e6-4c9e-8b9b-ea88ef3f3f0a%22%7d",
            organizer_name: "DCC Basel-Stadt",
            organizer_mail: "dcc@bs.ch",
            sessions: [
                {
                    id: "session-1",
                    location: "Microsoft Teams",
                    teams_link:
                        "https://teams.microsoft.com/l/meetup-join/19%3ameeting_NDg2YjUxYmItOTg3Yy00ZjY3LTgyZDgtNmY2NTIyNDE1NTI3%40thread.v2/0?context=%7b%22Tid%22%3a%2211172f95-a39a-4f7b-9224-c6a11d1e5c24%22%2c%22Oid%22%3a%22b702716c-e2e6-4c9e-8b9b-ea88ef3f3f0a%22%7d",
                    lessons: [
                        {
                            id: "lesson-1",
                            start: new Date("2025-08-27T10:00:00"),
                            end: new Date("2025-08-27T10:30:00"),
                        },
                    ],
                },
            ],
        },
    ],
};

// Helper function to generate a simple ID based on course properties
function generateCourseId(course: Course): string {
    return course.id;
}

// Helper function to find course by ID
function findCourseByIndex(id: string): number {
    return coursesData.courses.findIndex((course) => course.id === id);
}

export { coursesData, generateCourseId, findCourseByIndex };
