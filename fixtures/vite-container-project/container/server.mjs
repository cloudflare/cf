import { createServer } from "node:http";

const server = createServer((request, response) => {
	response.writeHead(200, { "content-type": "application/json" });
	response.end(
		JSON.stringify({
			source: "vite-container-fixture",
			method: request.method,
			path: request.url,
		})
	);
});

server.listen(8080, "0.0.0.0", () => {
	console.log("Container fixture listening on port 8080");
});
