/** @generated from get_RequestList */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/requests/${request.project_type}`,
	query: [
		"page",
		"pageSize",
		"status",
		"search",
		"createdBy",
		"assignee",
		"requestType",
		"priority",
		"tlp",
		"id",
		"readableId",
		"summary",
		"accountId",
		"metadata",
		"orderBy",
		"order",
	],
} as const;
