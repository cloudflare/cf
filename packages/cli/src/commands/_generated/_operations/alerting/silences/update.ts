/** @generated from notification-silences-update-silences */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/silences`,
	body: "json",
} as const;
