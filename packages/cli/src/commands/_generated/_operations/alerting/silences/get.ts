/** @generated from notification-silences-get-silence */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/silences/${request.silence_id}`,
} as const;
