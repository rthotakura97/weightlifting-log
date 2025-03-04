## 

## API

### Exercise APIs

1. `POST /exercise`
    1. Request → (ExerciseName, Weight, Sets, [optional] Reps, [optional] Time, [optional] WorkoutId)
    2. Response → EntryId
2. `GET /exercise/{entry_id}`
    1. Request → EntryId
    2. Response → (ExerciseName, Weight, Sets, [optional] Reps, [optional] Time, [optional] WorkoutId)
3. `GET /exercise/history/{exercise_name}`
    1. Request → ExerciseName
    2. Response → List<(ExerciseName, Weight, Sets, [optional] Reps, [optional] Tim, [optional] WorkoutId)>
4. `PUT /exercise/{entry_id}}`
    1. Request → (EntryId, ExerciseName, Weight, Sets, [optional] Reps, [optional] Tim, [optional] WorkoutId)
    2. Response → EntryId

### Workout APIs

1. `POST /workout`
    1. Request → None
    2. Response → EntryId
2. `GET /workout/{workout_id}`
    1. Request → WorkoutId
    2. Response → (WorkoutId, Timestamp)
3. `GET /workout/history/{time_range}`
    1. Request → Time Range
    2. Response → List<(WorkoutId, Timestamp)>
4. `PUT /workout/{workout_id}`
    1. Request → <(EntryId, WorkoutId, Timestamp)>
    2. Response → EntryId
5. `GET /workout/details/workout_id`
    1. Request → WorkoutId
    2. Response → List<(EntryId, ExerciseName, Weight, Sets, [optional] Reps, [optional] Time, [optional] WorkoutId)>