/** @generated from list-devices */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/physical-devices`,
	query: [
		"cursor",
		"sort_by",
		"sort_order",
		"last_seen_user.email",
		"seen_after",
		"seen_before",
		"per_page",
		"search",
		"active_registrations",
		"has_registration_type",
		"id",
		"tag",
		"last_seen_registration.policy.id",
		"include",
	],
	joined: [
		"cursor",
		"sort_by",
		"sort_order",
		"last_seen_user.email",
		"seen_after",
		"seen_before",
		"per_page",
		"search",
		"active_registrations",
		"has_registration_type",
		"last_seen_registration.policy.id",
	],
} as const;
