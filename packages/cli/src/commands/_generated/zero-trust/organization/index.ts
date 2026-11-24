import $create from "./create.js";
import $doh from "./doh/index.js";
import $edit from "./edit.js";
import $get from "./get.js";
import $trustsettings from "./trust-settings/index.js";
import $update from "./update.js";
/**
 * organization command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "organization",
	describe: "Operations for organization",

	routes: {
		create: $create,
		edit: $edit,
		get: $get,
		update: $update,
		doh: $doh,
		"trust-settings": $trustsettings,
	},
});

export default command;
