import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { HttpResponse } from "msw/http";

const ACCOUNT = "0123456789abcdef0123456789abcdef";

export const workflowRequestPaths: Record<string, string> = {
	"cf ai run": "/ai/run",
	"cf docs search": "/api/ai-search/search",
	"cf registrar registrations create": "/registrar/registrations",
	"cf workers versions create": "/versions",
	"cf workers triggers deploy": "/schedules",
	"cf previews deploy": "/deployments",
	"cf containers build": "/credentials",
	"cf containers push": "/credentials",
	"cf containers images list": "/_catalog",
	"cf containers images delete": "/manifests/",
	"cf containers ssh": "/ssh",
	"cf d1 migrations list": "/query",
	"cf d1 migrations apply": "/query",
	"cf tunnels tail": "/management",
};

function seed(files: Record<string, string>): void {
	for (const [path, contents] of Object.entries(files)) {
		mkdirSync(dirname(path), { recursive: true });
		writeFileSync(path, contents);
	}
}

export function seedWorkflow(command: string): void {
	if (
		[
			"cf workers versions create",
			"cf workers triggers deploy",
			"cf previews deploy",
			"cf workers check",
		].includes(command)
	) {
		const preview = command === "cf previews deploy";
		seed({
			"package.json": '{"devDependencies":{"wrangler":"4.136.0"}}',
			"node_modules/wrangler/package.json":
				'{"name":"wrangler","version":"4.136.0"}',
			"node_modules/wrangler/bin/cf-wrangler.js":
				"// Regression delegate: spawnImpl is intercepted by the suite.\n",
			".cloudflare/output/v0/config.json": JSON.stringify({
				accountId: ACCOUNT,
				buildContext: { isPreview: preview },
			}),
			".cloudflare/output/v0/workers/default/worker.config.json":
				JSON.stringify({
					name: "regression-worker",
					compatibilityDate: "2026-01-01",
					manifest: {
						type: "complete",
						mainModule: "index.js",
						modules: { "index.js": { type: "esm" } },
					},
					...(preview
						? {}
						: { triggers: [{ type: "scheduled", schedule: "*/5 * * * *" }] }),
				}),
			".cloudflare/output/v0/workers/default/bundle/index.js":
				"export default { fetch() { return new Response('regression'); } };\n",
		});
	}
	seed({
		"project/Dockerfile": "FROM scratch\n",
		"migrations/0001_regression.sql": "CREATE TABLE regression (id INTEGER);\n",
		"project/0001_regression.sql": "CREATE TABLE regression (id INTEGER);\n",
		"secrets.json": '{"REGRESSION_SECRET":"regression-secret"}',
	});
}

export function workflowResponse(command: string, request: Request): Response {
	const url = new URL(request.url);
	const path = url.pathname;
	const envelope = (result: unknown) =>
		HttpResponse.json({ success: true, result, errors: [], messages: [] });
	if (
		request.method === "GET" &&
		path.endsWith("/zones") &&
		url.searchParams.has("name")
	) {
		return envelope([
			{
				id: "abcdef0123456789abcdef0123456789",
				name: url.searchParams.get("name"),
			},
		]);
	}
	if (command === "cf docs search") {
		return envelope({ chunks: [] });
	}
	if (command === "cf ai run" && path.endsWith("/ai/models/schema")) {
		return envelope({
			input: { type: "object", properties: { prompt: { type: "string" } } },
		});
	}
	if (command === "cf registrar registrations create") {
		if (path.endsWith("/domain-check")) {
			return envelope({
				domains: [
					{
						name: "example.com",
						registrable: true,
						tier: "standard",
						pricing: {
							currency: "USD",
							registration_cost: "10.00",
							renewal_cost: "8.00",
						},
					},
				],
			});
		}
		if (path.includes("/registrar/extensions/")) {
			return envelope({
				registration_schema: {
					type: "object",
					required: ["domain_name"],
					properties: {
						domain_name: { type: "string" },
						years: { type: "integer", minimum: 1, default: 1 },
					},
				},
			});
		}
	}
	if (command.startsWith("cf d1 migrations")) {
		return envelope([{ success: true, results: [] }]);
	}
	if (command.startsWith("cf containers")) {
		if (path.endsWith("/containers/me")) {
			return envelope({
				external_account_id: ACCOUNT,
				limits: {
					vcpu_per_deployment: 1,
					memory_mib_per_deployment: 1024,
					disk_mb_per_deployment: 4000,
				},
			});
		}
		if (path.endsWith("/credentials")) {
			return envelope({
				username: "regression-user",
				password: "regression-password",
			});
		}
		if (path.endsWith("/ssh")) {
			return envelope({
				hostname: "example.com",
				username: "regression-user",
				port: 22,
			});
		}
		if (url.hostname === "registry.cloudflare.com") {
			if (path.endsWith("/tags/list")) {
				return HttpResponse.json({
					name: "regression-image",
					tags: ["latest"],
				});
			}
			if (path.endsWith("/_catalog")) {
				return HttpResponse.json({ repositories: ["regression-image"] });
			}
			if (request.method === "HEAD") {
				return new HttpResponse(null, {
					headers: { "Docker-Content-Digest": `sha256:${"d".repeat(64)}` },
				});
			}
			return new HttpResponse(null);
		}
	}
	if (command === "cf tunnels tail" && path.endsWith("/management")) {
		return envelope("regression-management-token");
	}
	if (
		[
			"cf workers versions create",
			"cf workers triggers deploy",
			"cf previews deploy",
		].includes(command)
	) {
		if (request.method === "GET" && /\/workers\/services\//.test(path)) {
			return envelope({
				id: "regression-service",
				default_environment: {
					environment: "production",
					script: {
						id: "regression-worker",
						tag: "current",
						tags: [],
						last_deployed_from: "cf_cli",
					},
				},
			});
		}
		if (request.method === "GET" && /\/workers\/workers\/[^/]+$/.test(path)) {
			return envelope({
				subdomain: { enabled: true, previews_enabled: true },
				previews_enabled: true,
				previews_base_config: {},
			});
		}
		if (request.method === "GET" && /\/workers\/scripts\/[^/]+$/.test(path)) {
			return HttpResponse.json(
				{
					success: false,
					errors: [{ code: 10007, message: "Worker not found" }],
				},
				{ status: 404 }
			);
		}
		if (path.endsWith("/subdomain")) {
			return envelope({ subdomain: "regression", enabled: true });
		}
		if (path.endsWith("/versions") && request.method === "POST") {
			return envelope({
				id: "regression-version",
				startup_time_ms: 0,
				metadata: { has_preview: false },
				resources: { script: { etag: "regression-etag" } },
			});
		}
		if (request.method === "PUT" && /\/workers\/scripts\/[^/]+$/.test(path)) {
			return envelope({
				id: "regression-worker",
				deployment_id: "regression-version",
				etag: "regression-etag",
				default_environment: { script: { tag: "regression-version" } },
			});
		}
		if (path.endsWith("/deployments")) {
			if (request.method === "GET") {
				return envelope({ deployments: [] });
			}
			return envelope({ id: "regression-deployment" });
		}
		if (path.includes("/previews")) {
			return envelope({
				id: "regression-preview",
				name: "regression",
				slug: "regression",
				urls: ["https://regression.example.workers.dev"],
			});
		}
		if (request.method === "GET") {
			return envelope([]);
		}
	}
	return envelope({});
}
