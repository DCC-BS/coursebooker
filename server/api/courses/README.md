# Courses API

This API provides CRUD operations for managing courses.

## Endpoints

### GET `/api/courses`
Retrieve all courses with optional filtering, se## Data Storage

Uses SQLite database for persistent storage. The database is automatically created and initialized with sample data on first run.

**Database Configuration:**
- Default: SQLite database at `./data/courses.db`
- Environment variables:
  - `DATABASE_TYPE`: Database type (`sqlite`, `postgresql`, `mysql`, `memory`)
  - `DATABASE_PATH`: Path to SQLite database file

**Database Features:**
- Automatic schema creation and migration
- Sample data insertion on first run
- Indexes for better query performance
- Unique constraints to prevent duplicate courses
- Timestamped records (created_at, updated_at)

**Future Database Support:**
The architecture supports easy switching between database backends. PostgreSQL and MySQL support can be added by implementing the `IDatabaseService` interface.hing, and pagination.

**Query Parameters:**
- `from` (string): Filter courses from this date (YYYY-MM-DD)
- `to` (string): Filter courses until this date (YYYY-MM-DD)
- `organizer` (string): Filter by organizer email
- `search` (string): Search in course name and description
- `sort` (string): Sort order - `asc` (default) or `desc`
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of courses per page (default: 10)

**Response:**
```json
{
  "courses": [...],
  "total": 7,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### POST `/api/courses`
Create a new course.

**Request Body:**
```json
{
  "name": "Course Name",
  "date": "2025-12-01",
  "time": "14:30",
  "duration": 2,
  "description": "Course description",
  "location": "Location",
  "teams_link": "https://teams.microsoft.com/...",
  "organizer_mail": "organizer@example.com"
}
```

**Required fields:** `name`, `date`, `time`, `duration`, `organizer_mail`

**Response:** `201 Created`
```json
{
  "success": true,
  "course": {...},
  "id": "course-name-2025-12-01-1430"
}
```

### GET `/api/courses/{id}`
Retrieve a specific course by ID.

**Response:**
```json
{
  "course": {...},
  "id": "course-name-2025-12-01-1430"
}
```

### PUT `/api/courses/{id}`
Update a complete course (replaces all fields).

**Request Body:** Same as POST

**Response:**
```json
{
  "success": true,
  "course": {...},
  "id": "course-name-2025-12-01-1430"
}
```

### PATCH `/api/courses/{id}`
Partially update a course (only provided fields are updated).

**Request Body:** Any subset of course fields
```json
{
  "duration": 3,
  "location": "New Location"
}
```

**Response:**
```json
{
  "success": true,
  "course": {...},
  "updated_fields": ["duration", "location"]
}
```

### DELETE `/api/courses/{id}`
Delete a course.

**Response:**
```json
{
  "success": true,
  "message": "Course deleted successfully",
  "course": {...}
}
```

### GET `/api/courses/stats`
Get course statistics.

**Response:**
```json
{
  "total_courses": 7,
  "upcoming_courses": 5,
  "past_courses": 2,
  "organizers": {
    "dcc@bs.ch": 7
  },
  "locations": {
    "Microsoft Teams": 3,
    "Wird noch bekanntgegeben": 4
  },
  "average_duration_hours": 1.36,
  "next_course": {...}
}
```

## Course ID Format

Course IDs are automatically generated based on the course name, date, and time:
`{name-kebab-case}-{date}-{time-without-colon}`

Example: `"wissensaustausch-data-science-&-ki-2025-10-23-1530"`

## Validation Rules

- **Date:** Must be in YYYY-MM-DD format
- **Time:** Must be in HH:MM format (24-hour)
- **Duration:** Must be a positive number (hours)
- **Email:** Must be a valid email format
- **Uniqueness:** No two courses can have the same name, date, and time

## Error Responses

- `400 Bad Request`: Invalid input data
- `404 Not Found`: Course not found
- `409 Conflict`: Course with same name, date, and time already exists
- `500 Internal Server Error`: Server error

## Data Storage

Currently uses in-memory storage with sample data. In production, this should be replaced with a persistent database.
