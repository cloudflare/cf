/** @generated from postV4AccountsByAccount_idPipelinesV1Sinks */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/sinks`,
	body: "json",
} as const;
