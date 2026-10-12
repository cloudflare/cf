/** @generated from create-hyperdrive */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/hyperdrive/configs`,
	body: "json",
} as const;
