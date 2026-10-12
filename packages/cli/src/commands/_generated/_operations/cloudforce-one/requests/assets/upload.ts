/** @generated from post_DashboardAssetUpload */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}/${request.request_id}/assets/upload`,
	pathParams: ["account_id", "project_type", "request_id"],
	body: "form",
} as const;
