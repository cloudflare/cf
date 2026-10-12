/** @generated from postV4AccountsByAccount_idPipelinesV1Validate_sql */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/validate_sql`,
	body: "json",
	errors: {
		422: "UnprocessableEntityError",
	},
} as const;
