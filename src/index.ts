export interface Env {
    DB: D1Database;
}

export default {
    async fetch(request: Request, env: Env): Promise<Response> {
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/').filter(Boolean);

        const apiType = pathParts[0];

        switch (apiType) {
            case "exercise": {
                return new Response(JSON.stringify(url.pathname), { status: 200 });
            }
            case "workout": {
                return new Response(JSON.stringify(url.pathname), { status: 200 });
            }
        }

        return new Response(JSON.stringify({ error: "Not Found" }), { status: 404 });
    },
};
