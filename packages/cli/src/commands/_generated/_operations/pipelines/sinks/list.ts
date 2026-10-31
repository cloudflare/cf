/** @generated from pipelines.sinks.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/sinks`,
	query: ["pipeline_id", "name", "order_by", "direction", "page", "per_page"],
} as const;
