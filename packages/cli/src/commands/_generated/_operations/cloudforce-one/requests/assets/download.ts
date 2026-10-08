/** @generated from cloudforce-one.requests.assets.download */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/v2/requests/{project_type}/{request_id}/assets/{asset_id}/download",
	response: "binary-response",
	errors: {
		404: "NotFoundError",
		410: "GoneError",
	},
} as const;
