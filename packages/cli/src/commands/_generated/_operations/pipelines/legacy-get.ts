/** @generated from pipelines.legacy-get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/${request.pipeline_name}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
