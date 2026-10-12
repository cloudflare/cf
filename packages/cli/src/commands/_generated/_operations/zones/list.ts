/** @generated from zones-get */
export default {
	method: "GET",
	path: () => "/zones",
	query: [
		"name",
		"status",
		"type",
		"account.id",
		"account.name",
		"page",
		"per_page",
		"order",
		"direction",
		"match",
	],
	joined: ["type"],
} as const;
