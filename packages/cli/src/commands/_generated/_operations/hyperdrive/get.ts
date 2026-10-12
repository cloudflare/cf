/** @generated from hyperdrive.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/hyperdrive/configs/${request.hyperdrive_id}`,
} as const;
