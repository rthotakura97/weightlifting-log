import { v4 as uuid } from 'uuid';
export interface Env {
    DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        console.log(request);

        const url = new URL(request.url);
        const pathParts = url.pathname.split('/').filter(Boolean);

        // Handle preflight requests for CORS
        if (request.method === "OPTIONS") {
            return handleCors();
        }

        const apiType = pathParts[0];

        switch (apiType) {
            case "exercise": {
                switch (request.method) {
                    case "POST": {
                        const json_body = await request.json();

                        const stmt = await env.DB.prepare(
                            "INSERT INTO ExerciseDb (WorkoutId, ExerciseName, Weight, Sets, Reps, Time) VALUES (?, ?, ?, ?, ?, ?)" 
                        )
                        .bind(
                            json_body.WorkoutId ?? null,
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
                            const exerciseName = pathParts[2];
                            const stmt = await env.DB.prepare(
                                "SELECT * FROM ExerciseDb WHERE ExerciseName = ?"
                            )
                            .bind(exerciseName)
                            .all();

                            return responseWithHeaders(JSON.stringify(stmt.results), 200);
                        } else {
                            const entryId = pathParts[1];
                            const stmt = await env.DB.prepare(
                                "SELECT * FROM ExerciseDb WHERE EntryId = ?"
                            )
                            .bind(entryId)
                            .all();

                            return responseWithHeaders(JSON.stringify(stmt.results), 200);
                        }
                    }
                    case "PUT": {
                        const entryId = pathParts[1];
                        const json_body = await request.json();

                        const stmt = await env.DB.prepare(
                            "UPDATE ExerciseDb SET WorkoutId = ?, ExerciseName = ?, Weight = ?, Sets = ?, Reps = ?, Time = ? WHERE EntryId = ?"
                        )
                        .bind(
                            json_body.WorkoutId ?? null,
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
                            "INSERT INTO WorkoutDb (WorkoutId) VALUES (?)"
                        )
                        .bind(uuidV4)
                        .run();

                        return responseWithHeaders(JSON.stringify(uuidV4), 200);
                    }
                    case "GET": {
                        if (pathParts[1] == "history") {
                            const stmt = await env.DB.prepare(
                                "SELECT * FROM WorkoutDb"
                            )
                            .all();

                            return responseWithHeaders(JSON.stringify(stmt.results), 200);
                        } else {
                            const workoutId = pathParts[1];
                            const stmt = await env.DB.prepare(
                                "SELECT * FROM WorkoutDb WHERE WorkoutId = ?"
                            )
                            .bind(workoutId)
                            .all();

                            return responseWithHeaders(JSON.stringify(stmt.results), 200);
                        }
                    }
                    case "PUT": {
                        const workoutId = pathParts[1];
                        const json_body = await request.json();

                        const stmt = await env.DB.prepare(
                            "UPDATE WorkoutDb SET WorkoutId = ?, Timestamp = ? WHERE WorkoutId = ?"
                        )
                        .bind(
                            json_body.WorkoutId,
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
    },
};

// Build the response for requests with the appropriate headers
function responseWithHeaders(jsonStringData: string, status: number) {
    return new Response(jsonStringData, { status: 200, headers: {...addBaseHeaders(), ...addCorsHeaders()} })
}

// If the request is OPTION, this is a CORS preflight request. In this case
// we will return back to client stating that any client from any origin can access
// this worker. See https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Origin.
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