/** @generated from accounts.ut-billing.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/settings/ut-billing`,
	body: "json",
	constants: {
		value: "on",
	},
} as const;
