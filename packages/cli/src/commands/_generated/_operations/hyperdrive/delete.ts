/** @generated from delete-hyperdrive */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/hyperdrive/configs/${request.hyperdrive_id}`,
} as const;
