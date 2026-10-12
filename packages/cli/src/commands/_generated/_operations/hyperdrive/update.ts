/** @generated from patch-hyperdrive */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/hyperdrive/configs/${request.hyperdrive_id}`,
	body: "json",
} as const;
