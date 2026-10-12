/** @generated from alerting.silences.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/alerting/v3/silences`,
	body: "json",
} as const;
