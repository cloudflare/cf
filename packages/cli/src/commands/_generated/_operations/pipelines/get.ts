/** @generated from getV4AccountsByAccount_idPipelinesV1PipelinesByPipeline_id */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/pipelines/${request.pipeline_id}`,
} as const;
