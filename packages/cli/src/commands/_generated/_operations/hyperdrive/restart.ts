/** @generated from restart-hyperdrive */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/hyperdrive/configs/${request.hyperdrive_id}/restart`,
} as const;
