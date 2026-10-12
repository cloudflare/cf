/** @generated from deleteV4AccountsByAccount_idPipelinesByPipeline_name_deprecated */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/${request.pipeline_name}`,
	response: false,
} as const;
