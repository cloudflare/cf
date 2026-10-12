/** @generated from getV4AccountsByAccount_idPipelinesV1Pipelines */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/pipelines`,
	query: ["page", "per_page", "name"],
} as const;
