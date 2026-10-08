/** @generated from organization.member.list */
export default {
	method: "GET",
	path: "/organizations/{organization_id}/members",
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
