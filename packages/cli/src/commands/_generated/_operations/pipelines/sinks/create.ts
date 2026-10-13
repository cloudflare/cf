/** @generated from pipelines.sinks.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/sinks`,
	body: "json",
} as const;
