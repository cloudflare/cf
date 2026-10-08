/** @generated from zero-trust.access.applications.list */
export default {
	method: "GET",
	path: "/{account_or_zone}/{account_or_zone_id}/access/apps",
	query: [
		"name",
		"domain",
		"aud",
		"target_attributes",
		"exact",
		"search",
		"page",
		"per_page",
	],
} as const;
