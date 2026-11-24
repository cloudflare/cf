import $get from "./get.js";
import $list from "./list.js";
import $previewtokens from "./preview-tokens/index.js";
import $update from "./update.js";
/**
 * account-custom-pages command group
 * @generated from apis/overlays/custom-pages.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "account-custom-pages",
	describe: "Manage account-level custom pages",

	routes: {
		get: $get,
		list: $list,
		update: $update,
		"preview-tokens": $previewtokens,
	},
});

export default command;
