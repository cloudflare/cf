/** @generated from tenants.accounts.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/tenants/${request.tenant_id}/accounts`,
	query: [
		"account_pubname",
		"account_pubname.startsWith",
		"account_pubname.endsWith",
		"account_pubname.contains",
		"name",
		"name.startsWith",
		"name.endsWith",
		"name.contains",
		"status",
		"order_by",
		"direction",
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
		"status",
		"order_by",
		"direction",
		"include_total",
		"page_token",
		"page_size",
	],
} as const;
