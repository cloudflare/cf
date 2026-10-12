/** @generated from pipelines.legacy-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pipelines/${request.pipeline_name}`,
	body: "json",
} as const;
