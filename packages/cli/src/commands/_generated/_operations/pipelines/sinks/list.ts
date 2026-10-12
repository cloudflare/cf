/** @generated from getV4AccountsByAccount_idPipelinesV1Sinks */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/sinks`,
	query: ["pipeline_id", "name", "page", "per_page"],
} as const;
