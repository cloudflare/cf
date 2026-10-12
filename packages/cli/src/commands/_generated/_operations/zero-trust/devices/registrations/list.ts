/** @generated from list-registrations */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/devices/registrations`,
	query: [
		"user.id",
		"seen_after",
		"seen_before",
		"status",
		"registration_type",
		"per_page",
		"search",
		"sort_by",
		"sort_order",
		"cursor",
		"id",
		"device.id",
		"policy.id",
		"include",
	],
	joined: [
		"seen_after",
		"seen_before",
		"status",
		"registration_type",
		"per_page",
		"search",
		"sort_by",
		"sort_order",
		"cursor",
		"device.id",
		"policy.id",
	],
} as const;
