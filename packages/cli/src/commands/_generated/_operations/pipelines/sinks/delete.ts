/** @generated from pipelines.sinks.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/sinks/${request.sink_id}`,
} as const;
