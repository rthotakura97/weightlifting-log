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
           "WorkoutId": "random-id"
         }'
```

Get random exercise by entry ID
```
curl -X GET http://localhost:8787/exercise/1
```