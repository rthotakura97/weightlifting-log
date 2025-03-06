-- Create WorkoutDB (Stores workout sessions)
CREATE TABLE IF NOT EXISTS WorkoutDB (
    EntryId INTEGER PRIMARY KEY AUTOINCREMENT,
    WorkoutID TEXT UNIQUE NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create ExerciseDB (Logs individual exercises, optionally linked to a workout)
CREATE TABLE IF NOT EXISTS ExerciseDB (
    EntryId INTEGER PRIMARY KEY AUTOINCREMENT,
    WorkoutID TEXT NULL,
    ExerciseName TEXT NOT NULL,
    Timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    Weight FLOAT NOT NULL,
    Sets INTEGER NOT NULL,
    Reps INTEGER NULL,
    Time INTEGER NULL,
    FOREIGN KEY (WorkoutID) REFERENCES WorkoutDB(WorkoutID) ON DELETE SET NULL
);

-- Index for fast lookups by exercise name
CREATE INDEX IF NOT EXISTS idx_exercise_name ON ExerciseDB (ExerciseName);

-- Index for fetching exercises by workout
CREATE INDEX IF NOT EXISTS idx_exercise_workout ON ExerciseDB (WorkoutID);

-- Index for fast sorting of workouts by timestamp
CREATE INDEX IF NOT EXISTS idx_workout_timestamp ON WorkoutDB (Timestamp);

-- Index to ensure fast joins between ExerciseDB and WorkoutDB
CREATE INDEX IF NOT EXISTS idx_workout_id ON WorkoutDB (WorkoutID);
