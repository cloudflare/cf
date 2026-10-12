/** @generated from user.billing.history.list */
export default {
	method: "GET",
	path: () => "/user/billing/history",
	query: ["page", "per_page", "order", "occurred_at", "type", "action"],
} as const;
