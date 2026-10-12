/** @generated from notification-silences-list-silences */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/silences`,
} as const;
