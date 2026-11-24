import $origin from "./origin/index.js";
import $tls from "./tls/index.js";
/**
 * post-quantum command group
 * @generated from apis/overlays/radar.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "post-quantum",
	describe:
		"Post-quantum encryption adoption and deployment trends across the Internet",

	routes: {
		origin: $origin,
		tls: $tls,
	},
});

export default command;
