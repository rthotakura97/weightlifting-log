# weightlifting-log

## Usage
* Make sure to configure local node version
```
nvm use stable
```

## Test locally
```
wrangler dev
```

## Deploy
```
wrangler deploy
```

## Use CURL to test
Examples
```
curl -X POST http://localhost:8787/exercise \
     -H "Content-Type: application/json" \
     -d '{
           "ExerciseName": "Squat",
           "Weight": 100,
           "Sets": 3,
           "Reps": 5,
           "Time": 60
         }'
```
```
curl -X GET http://localhost:8787/exercise/1
```