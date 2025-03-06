import { v4 as uuid } from 'uuid';
export interface Env {
    DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        console.log(request);

        const url = new URL(request.url);
        const pathParts = url.pathname.split('/').filter(Boolean);

        // Handle Preflight CORS Request (OPTIONS method)
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
                            "INSERT INTO ExerciseDb (WorkoutId, ExerciseName, Weight, Sets, Reps, Time) VALUES (?, ?, ?, ?, ?, ?)" // ✅ Now expects 6 values
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
                              
                        return new Response(JSON.stringify(stmt.meta.last_row_id), { status: 200, headers: getCorsHeaders() });
                    }
                    case "GET": {
                        if (pathParts[1] == "history") {
                            const exerciseName = pathParts[2];
                            const stmt = await env.DB.prepare(
                                "SELECT * FROM ExerciseDb WHERE ExerciseName = ?"
                            )
                            .bind(exerciseName)
                            .all();

                            return new Response(JSON.stringify(stmt.results), { status: 200, headers: getCorsHeaders() });
                        } else {
                            const entryId = pathParts[1];
                            const stmt = await env.DB.prepare(
                                "SELECT * FROM ExerciseDb WHERE EntryId = ?"
                            )
                            .bind(entryId)
                            .all();

                            return new Response(JSON.stringify(stmt.results), { status: 200, headers: getCorsHeaders() });
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

                        return new Response(JSON.stringify(stmt.results), { status: 200, headers: getCorsHeaders() });
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

                        return new Response(JSON.stringify(uuidV4), { status: 200, headers: getCorsHeaders() });
                    }
                    case "GET": {
                        if (pathParts[1] == "history") {
                            const stmt = await env.DB.prepare(
                                "SELECT * FROM WorkoutDb"
                            )
                            .all();

                            return new Response(JSON.stringify(stmt.results), { status: 200, headers: getCorsHeaders() });
                        } else {
                            const workoutId = pathParts[1];
                            const stmt = await env.DB.prepare(
                                "SELECT * FROM WorkoutDb WHERE WorkoutId = ?"
                            )
                            .bind(workoutId)
                            .all();

                            return new Response(JSON.stringify(stmt.results), { status: 200, headers: getCorsHeaders() });
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

                        return new Response(JSON.stringify(stmt.results), { status: 200, headers: getCorsHeaders() });
                    }
                }                
            }
        }

        return new Response(JSON.stringify({ error: "Not Found" }), { status: 404, headers: getCorsHeaders() });
    },
};

function handleCors() {
    return new Response(null, {
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }
    });
}

function getCorsHeaders() {
    return {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
    };
}