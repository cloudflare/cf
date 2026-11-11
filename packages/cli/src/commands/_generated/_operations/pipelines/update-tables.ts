/** @generated from pipelines.update-tables */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/v1/pipelines/${request.pipeline_id}/update_tables`,
} as const;
