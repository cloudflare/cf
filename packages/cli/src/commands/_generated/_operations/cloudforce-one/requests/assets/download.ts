/** @generated from get_DashboardAssetDownload */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}/${request.request_id}/assets/${request.asset_id}/download`,
	response: "binary-response",
	errors: {
		404: "NotFoundError",
		410: "GoneError",
	},
} as const;
