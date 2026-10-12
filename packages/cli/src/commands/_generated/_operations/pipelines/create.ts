/** @generated from postV4AccountsByAccount_idPipelinesV1Pipelines */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/pipelines`,
	body: "json",
} as const;
