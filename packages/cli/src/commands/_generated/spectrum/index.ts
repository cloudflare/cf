import $analytics from "./analytics/index.js";
import $apps from "./apps/index.js";
import $protocols from "./protocols/index.js";
/**
 * spectrum command
 * @generated from apis/overlays/spectrum.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "spectrum",
	describe:
		"Proxy and protect arbitrary TCP/UDP applications through Cloudflare's network with DDoS mitigation",

	routes: {
		analytics: $analytics,
		apps: $apps,
		protocols: $protocols,
	},
});

export default command;
