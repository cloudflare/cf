/** @generated from generated:get:/{account_or_zone}/{account_or_zone_id}/security-center/insights/class */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/security-center/insights/class`,
	query: [
		"dismissed",
		"issue_class",
		"issue_type",
		"product",
		"source",
		"severity",
		"subject",
		"issue_class~neq",
		"issue_type~neq",
		"product~neq",
		"severity~neq",
		"subject~neq",
	],
} as const;
