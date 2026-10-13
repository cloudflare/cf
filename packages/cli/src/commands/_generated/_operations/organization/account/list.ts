/** @generated from organization.account.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/accounts`,
	query: [
		"account_pubname",
		"account_pubname.startsWith",
		"account_pubname.endsWith",
		"account_pubname.contains",
		"name",
		"name.startsWith",
		"name.endsWith",
		"name.contains",
		"order_by",
		"direction",
		"include_tags",
		"include_total",
		"page_token",
		"page_size",
	],
	joined: [
		"account_pubname",
		"account_pubname.startsWith",
		"account_pubname.endsWith",
		"account_pubname.contains",
		"name",
		"name.startsWith",
		"name.endsWith",
		"name.contains",
		"order_by",
		"direction",
		"include_tags",
		"include_total",
		"page_token",
		"page_size",
	],
} as const;
