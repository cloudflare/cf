import { expect, it } from "vite-plus/test";
import { bindings } from "../config.js";

it("exports fixed-audience workload identity with independent grant and HTTP limits", () => {
	const limits = {
		audience: "urn:orders",
		authorization_grants: {
			allowed_authorization_servers: ["https://auth.example/"],
			allowed_scopes: ["orders.read"],
		},
		request_signing: {
			profile: "cloudflare-workload-http-v1" as const,
			allowed_origins: ["https://api.example"],
			allowed_methods: ["GET"],
		},
	};
	expect(bindings.identity(limits)).toEqual({ type: "identity", ...limits });
});
