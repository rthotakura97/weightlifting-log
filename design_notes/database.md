## Data

- Exercise → Simple (Timestamp, Exercise name, weight, sets, reps, time), Extended (per-set = isFailure, RIR)
- Workout → List of exercises, be able to group by supersets

## Database Schema

We will use Cloudflare D1 because of its easy integration with Cloudflare workers and its SQLite backed DB, which is great for our use case (super structured data).

### Exercise DB

Entry:

- **[Primary Key] EntryId (Integer)**
- **[Index] ExerciseName (String)**
- **[Optional][Index] WorkoutId (String)**
- Timestamp (Time)
- Weight (Float)
- Sets (Integer)
- [Optional] Reps (Integer)
- [Optional] Time(seconds) (Integer)

```sql
CREATE TABLE ExerciseDB (
EntryId INTEGER PRIMARY KEY AUTOINCREMENT,
WorkoutID TEXT NULL,  -- Nullable, only set if exercise is part of a workout
ExerciseName TEXT NOT NULL,
Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
Weight FLOAT NOT NULL,
Sets INTEGER NOT NULL,
Reps INTEGER NULL,   -- Nullable
Time INTEGER NULL,   -- Nullable
FOREIGN KEY (WorkoutID) REFERENCES WorkoutDB(WorkoutID) ON DELETE SET NULL
);
```

### Workout DB

Entry:

- **[Primary Key] EntryId (Integer)**
- **[Index] WorkoutId (String)**
- **[Index] Timestamp = Time**

```sql
CREATE TABLE IF NOT EXISTS WorkoutDB (
    EntryId INTEGER PRIMARY KEY AUTOINCREMENT,
    WorkoutID TEXT UNIQUE NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);"

```

### Indexes

See above for fields that we will index.

```
CREATE INDEX IF NOT EXISTS idx_exercise_name ON ExerciseDB (ExerciseName);
CREATE INDEX IF NOT EXISTS idx_exercise_workout ON ExerciseDB (WorkoutID);
CREATE INDEX IF NOT EXISTS idx_workout_timestamp ON WorkoutDB (Timestamp);
CREATE INDEX IF NOT EXISTS idx_workout_id ON WorkoutDB (WorkoutID);

```