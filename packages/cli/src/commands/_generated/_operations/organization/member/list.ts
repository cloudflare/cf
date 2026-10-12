/** @generated from Members_list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/organizations/${request.organization_id}/members`,
	query: [
		"status",
		"user.email",
		"user.email.contains",
		"user.email.startsWith",
		"user.email.endsWith",
		"page_token",
		"page_size",
	],
	joined: [
		"user.email",
		"user.email.contains",
		"user.email.startsWith",
		"user.email.endsWith",
		"page_token",
		"page_size",
	],
} as const;
