/** @generated from getV4AccountsByAccount_idPipelinesByPipeline_name_deprecated */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/${request.pipeline_name}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
