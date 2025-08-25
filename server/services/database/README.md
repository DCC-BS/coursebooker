# Database Service Documentation

This document describes the database service architecture implemented for the Coursebook application.

## Architecture Overview

The database service uses a layered architecture that allows for easy switching between different database backends:

```
API Endpoints
    ↓
Database Service Interface (IDatabaseService)
    ↓
Concrete Implementation (SQLiteService, PostgreSQLService, etc.)
    ↓
Actual Database (SQLite, PostgreSQL, MySQL, etc.)
```

## Files Structure

```
server/services/database/
├── index.ts                 # Main exports
├── types.ts                 # Interface definitions
├── sqlite.service.ts        # SQLite implementation
└── factory.ts              # Database factory and singleton
```

## Key Components

### 1. IDatabaseService Interface (`types.ts`)
Defines the contract that all database implementations must follow:
- **Course Operations**: CRUD operations for courses
- **Statistics**: Analytics and reporting methods
- **Database Management**: Initialize and close methods

### 2. SQLiteService (`sqlite.service.ts`)
Current implementation using better-sqlite3:
- **Features**:
  - Automatic schema creation
  - Sample data insertion
  - Indexes for performance
  - Unique constraints
  - Timestamped records
- **Performance**: Optimized queries with proper indexing
- **Reliability**: Error handling and constraint validation

### 3. Database Factory (`factory.ts`)
- **Singleton Pattern**: Ensures single database connection
- **Environment Configuration**: Uses environment variables
- **Graceful Shutdown**: Proper cleanup on process termination

## Environment Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_TYPE` | `sqlite` | Database type (`sqlite`, `postgresql`, `mysql`) |
| `DATABASE_PATH` | `./data/courses.db` | Path to SQLite database file |

## Database Schema

### Courses Table
```sql
CREATE TABLE courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  duration REAL NOT NULL,
  description TEXT DEFAULT '',
  location TEXT DEFAULT '',
  teams_link TEXT DEFAULT '',
  organizer_mail TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, date, time)
);
```

### Indexes
- `idx_courses_date`: For date-based queries
- `idx_courses_organizer`: For organizer filtering
- `idx_courses_datetime`: For datetime sorting

## API Integration

All API endpoints in `server/api/courses/` use the database service:

```typescript
import { getDatabase } from '../../services/database'

export default defineEventHandler(async (event) => {
  const db = await getDatabase()
  // Use db methods...
})
```

## Features

### ✅ Implemented
- **SQLite Backend**: Full CRUD operations
- **Auto-initialization**: Schema and sample data
- **Filtering & Pagination**: Advanced query capabilities
- **Statistics**: Analytics and reporting
- **Type Safety**: Full TypeScript support
- **Error Handling**: Comprehensive error management

### 🚧 Future Enhancements
- **PostgreSQL Support**: Enterprise database option
- **MySQL Support**: Alternative RDBMS option
- **In-Memory Database**: For testing purposes
- **Connection Pooling**: For high-performance scenarios
- **Migrations**: Database schema versioning
- **Backup/Restore**: Data management tools

## Usage Examples

### Basic Operations
```typescript
const db = await getDatabase()

// Get all courses
const courses = await db.getAllCourses()

// Create a course
const newCourse = await db.createCourse({
  name: "New Course",
  date: "2025-12-01",
  time: "14:30",
  duration: 2,
  description: "Course description",
  organizer_mail: "organizer@example.com"
})

// Update a course
const updated = await db.updateCourse('course-id', {
  duration: 3
})

// Delete a course
const deleted = await db.deleteCourse('course-id')
```

### Advanced Filtering
```typescript
const filtered = await db.getAllCourses({
  fromDate: '2025-01-01',
  toDate: '2025-12-31',
  organizer: 'dcc@bs.ch',
  search: 'Data Science',
  sortOrder: 'desc',
  page: 1,
  limit: 10
})
```

### Statistics
```typescript
const stats = {
  total: await db.getCoursesCount(),
  organizers: await db.getCoursesByOrganizer(),
  locations: await db.getCoursesByLocation(),
  avgDuration: await db.getAverageDuration(),
  nextCourse: await db.getNextUpcomingCourse()
}
```

## Adding New Database Backends

To add support for a new database (e.g., PostgreSQL):

1. **Create Implementation**:
   ```typescript
   // postgresql.service.ts
   export class PostgreSQLService implements IDatabaseService {
     // Implement all interface methods
   }
   ```

2. **Update Factory**:
   ```typescript
   // factory.ts
   case 'postgresql':
     return new PostgreSQLService(options)
   ```

3. **Environment Variables**:
   ```bash
   DATABASE_TYPE=postgresql
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=coursebook
   DATABASE_USERNAME=user
   DATABASE_PASSWORD=password
   ```

## Testing

The database service can be tested with different backends by changing the `DATABASE_TYPE` environment variable. For unit testing, an in-memory implementation could be created.

## Performance Considerations

- **Indexes**: Proper indexing for common query patterns
- **Connection Management**: Singleton pattern reduces connection overhead
- **Query Optimization**: Efficient SQL queries with minimal data transfer
- **Batch Operations**: Support for bulk operations when needed

## Security

- **SQL Injection Prevention**: Parameterized queries
- **Input Validation**: Type checking and constraint validation
- **Error Handling**: Secure error messages without exposing internals
- **Connection Security**: Environment-based configuration
