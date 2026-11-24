import $create from "./create.js";
import $delete from "./delete.js";
import $liveview from "./live-view/index.js";
import $protocol from "./protocol.js";
import $targets from "./targets/index.js";
import $version from "./version.js";
/**
 * browser command group
 * @generated from apis/overlays/browser-run.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "browser",
	describe: "Operations for devtools.browser",

	routes: {
		create: $create,
		delete: $delete,
		protocol: $protocol,
		version: $version,
		"live-view": $liveview,
		targets: $targets,
	},
});

export default command;
