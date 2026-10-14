/** @generated from pipelines.sinks.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/sinks/${request.sink_id}`,
} as const;
