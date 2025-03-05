## Testing
### curl
Examples

Exercise without time
```
curl -X POST http://localhost:8787/exercise \
     -H "Content-Type: application/json" \
     -d '{
           "ExerciseName": "Squat",
           "Weight": 100,
           "Sets": 3,
           "Reps": 5
         }'
```

Timed exercise
```
curl -X POST http://localhost:8787/exercise \
     -H "Content-Type: application/json" \
     -d '{
           "ExerciseName": "Plank",
           "Weight": 0,
           "Sets": 3,
           "Time": 45
         }'
```

With WorkoutId
```
curl -X POST http://localhost:8787/exercise \
     -H "Content-Type: application/json" \
     -d '{
           "ExerciseName": "Squat",
           "Weight": 100,
           "Sets": 3,
           "Reps": 5,
           "WorkoutId": "15e275d2-15f0-4a39-9934-11bc348d19e4"
         }'
```

Put
```
curl -X PUT http://localhost:8787/exercise/1 \
     -H "Content-Type: application/json" \
     -d '{
           "ExerciseName": "Squat",
           "Weight": 100,
           "Sets": 3,
           "Reps": 10
         }'
```

Get random exercise by entry ID
```
curl -X GET http://localhost:8787/exercise/1
```

New workout
```
curl -X POST http://localhost:8787/workout
```


Get workout by ID
```
curl -X GET http://localhost:8787/workout/15e275d2-15f0-4a39-9934-11bc348d19e4
```

Workout history
```
curl -X GET http://localhost:8787/workout/history
```

PUT for workout
```
curl -X PUT http://localhost:8787/workout/15e275d2-15f0-4a39-9934-11bc348d19e4 \
     -H "Content-Type: application/json" \
     -d '{
           "WorkoutId": "15e275d2-15f0-4a39-9934-11bc348d19e4",
           "Timestamp": "2024-03-07 14:30:00"
         }'
```