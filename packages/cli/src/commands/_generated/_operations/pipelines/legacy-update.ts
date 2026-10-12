/** @generated from putV4AccountsByAccount_idPipelinesByPipeline_name_deprecated */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/${request.pipeline_name}`,
	body: "json",
} as const;
