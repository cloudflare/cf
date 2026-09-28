export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/var") {
			return new Response(env.MY_VAR);
		}

		return Response.json({
			fixture: "vite-plugin-project",
			url: request.url,
			var: env.MY_VAR,
			asset: "/message.txt",
		});
	},
};
