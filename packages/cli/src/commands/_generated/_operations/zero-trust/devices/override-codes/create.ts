/** @generated from create-override-code */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/override_codes`,
	body: "json",
	constants: {
		type: "uninstall_protection",
	},
} as const;
