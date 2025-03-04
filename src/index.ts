export interface Env {
    DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);

        if (request.method === "POST" && url.pathname === "/log") {
            const { exercise, weight, reps } = await request.json();

            if (!exercise || !weight || !reps) {
                return new Response(JSON.stringify({ error: "Missing fields" }), { status: 400 });
            }

            await env.DB.prepare(
                "INSERT INTO logs (exercise, weight, reps) VALUES (?, ?, ?)"
            )
            .bind(exercise, weight, reps)
            .run();

            return new Response(JSON.stringify({ success: true }), { status: 201 });
        }

        if (request.method === "GET" && url.pathname === "/logs") {
            const { results } = await env.DB.prepare("SELECT * FROM logs ORDER BY date DESC").all();
            return new Response(JSON.stringify(results), { status: 200 });
        }

        return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
    },
};
