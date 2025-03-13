import { v4 as uuid } from 'uuid';
import type { D1Database } from '@cloudflare/workers-types';
import type { EventContext } from '@cloudflare/workers-types/experimental';

interface ExerciseRequest {
    WorkoutID?: string;
    ExerciseName: string;
    Weight: number;
    Sets: number;
    Reps?: number;
    Time?: number;
}

interface WorkoutRequest {
    WorkoutID: string;
    Timestamp: string;
}

export interface Env {
    DB: D1Database;
}

export const onRequest = async (context: EventContext<Env, string, {}>) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/').filter(Boolean);

    // Remove 'api' from the path parts since it's part of the functions directory structure
    pathParts.shift();

    // Handle preflight requests for CORS
    if (request.method === "OPTIONS") {
        return handleCors();
    }

    const apiType = pathParts[0];

    switch (apiType) {
        case "exercise": {
            switch (request.method) {
                case "POST": {
                    const json_body = await request.json() as ExerciseRequest;

                    const stmt = await env.DB.prepare(
                        "INSERT INTO ExerciseDB (WorkoutID, ExerciseName, Weight, Sets, Reps, Time) VALUES (?, ?, ?, ?, ?, ?)" 
                    )
                    .bind(
                        json_body.WorkoutID ?? null,
                        json_body.ExerciseName, 
                        json_body.Weight,
                        json_body.Sets,
                        json_body.Reps ?? null,
                        json_body.Time ?? null
                    )
                    .run();
                          
                    return responseWithHeaders(JSON.stringify(stmt.meta.last_row_id), 200);
                }
                case "GET": {
                    if (pathParts[1] == "history") {
                        console.log('Exercise history path parts:', pathParts);
                        const encodedExerciseName = pathParts[2];
                        
                        if (!encodedExerciseName) {
                            console.log('No exercise name provided');
                            return responseWithHeaders(JSON.stringify([]), 200);
                        }
                        
                        // Decode the URL-encoded search term
                        const exerciseName = decodeURIComponent(encodedExerciseName);
                        console.log('Searching for exercises with name:', exerciseName);
                        
                        const stmt = await env.DB.prepare(
                            "SELECT * FROM ExerciseDB WHERE LOWER(ExerciseName) LIKE LOWER(?)"
                        )
                        .bind(`%${exerciseName}%`)
                        .all();

                        console.log('Found exercises:', stmt.results);
                        return responseWithHeaders(JSON.stringify(stmt.results), 200);
                    } else if (pathParts[1] == "workout") {
                        const workoutId = pathParts[2];
                        console.log('Fetching exercises for workout ID:', workoutId);
                        const stmt = await env.DB.prepare(
                            "SELECT * FROM ExerciseDB WHERE WorkoutID = ?"
                        )
                        .bind(workoutId)
                        .all();

                        const results = stmt.results;
                        console.log('Found exercises:', results);
                        return responseWithHeaders(JSON.stringify(results), 200);
                    } else {
                        const entryId = pathParts[1];
                        const stmt = await env.DB.prepare(
                            "SELECT * FROM ExerciseDB WHERE EntryId = ?"
                        )
                        .bind(entryId)
                        .all();

                        return responseWithHeaders(JSON.stringify(stmt.results), 200);
                    }
                }
                case "PUT": {
                    const entryId = pathParts[1];
                    const json_body = await request.json() as ExerciseRequest;

                    const stmt = await env.DB.prepare(
                        "UPDATE ExerciseDB SET WorkoutID = ?, ExerciseName = ?, Weight = ?, Sets = ?, Reps = ?, Time = ? WHERE EntryId = ?"
                    )
                    .bind(
                        json_body.WorkoutID ?? null,
                        json_body.ExerciseName,
                        json_body.Weight,
                        json_body.Sets,
                        json_body.Reps ?? null,
                        json_body.Time ?? null,
                        entryId
                    )
                    .run();

                    return responseWithHeaders(JSON.stringify(stmt.results), 200);
                }
            }
        }
        case "workout": {
            switch (request.method) {
                case "POST": {
                    let uuidV4: string = uuid();

                    const stmt = await env.DB.prepare(
                        "INSERT INTO WorkoutDB (WorkoutID) VALUES (?)"
                    )
                    .bind(uuidV4)
                    .run();

                    return responseWithHeaders(JSON.stringify(uuidV4), 200);
                }
                case "GET": {
                    if (pathParts[1] == "history") {
                        const stmt = await env.DB.prepare(
                            "SELECT * FROM WorkoutDB"
                        )
                        .all();

                        return responseWithHeaders(JSON.stringify(stmt.results), 200);
                    } else {
                        const workoutId = pathParts[1];
                        const stmt = await env.DB.prepare(
                            "SELECT * FROM WorkoutDB WHERE WorkoutID = ?"
                        )
                        .bind(workoutId)
                        .all();

                        return responseWithHeaders(JSON.stringify(stmt.results), 200);
                    }
                }
                case "PUT": {
                    const workoutId = pathParts[1];
                    const json_body = await request.json() as WorkoutRequest;

                    const stmt = await env.DB.prepare(
                        "UPDATE WorkoutDB SET WorkoutID = ?, Timestamp = ? WHERE WorkoutID = ?"
                    )
                    .bind(
                        json_body.WorkoutID,
                        json_body.Timestamp,
                        workoutId
                    )
                    .run();

                    return responseWithHeaders(JSON.stringify(stmt.results), 200);
                }
            }                
        }
    }

    return responseWithHeaders(JSON.stringify({ error: "Not Found" }), 404);
};

// Build the response for requests with the appropriate headers
function responseWithHeaders(jsonStringData: string, status: number) {
    return new Response(jsonStringData, { status: 200, headers: {...addBaseHeaders(), ...addCorsHeaders()} })
}

// If the request is OPTION, this is a CORS preflight request
function handleCors() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}

function addBaseHeaders() {
    return {
        "Content-Type": "application/json"
    }
}

function addCorsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*"
    };
} 