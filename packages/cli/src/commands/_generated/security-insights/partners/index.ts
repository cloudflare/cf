import $settings from "./settings/index.js";
import $shadowhosts from "./shadow-hosts/index.js";
import $shadowzonehosts from "./shadow-zone-hosts/index.js";
import $shadowzones from "./shadow-zones/index.js";
/**
 * partners command group
 * @generated from apis/overlays/security-insights.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "partners",
	describe: "Operations for partners",

	routes: {
		settings: $settings,
		"shadow-hosts": $shadowhosts,
		"shadow-zone-hosts": $shadowzonehosts,
		"shadow-zones": $shadowzones,
	},
});

export default command;
