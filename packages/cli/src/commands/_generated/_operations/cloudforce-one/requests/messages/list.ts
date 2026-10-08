/** @generated from cloudforce-one.requests.messages.list */
export default {
	method: "GET",
	path: "/accounts/{account_id}/cloudforce-one/v2/requests/{project_type}/{request_id}/messages",
	query: ["page", "per_page"],
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
