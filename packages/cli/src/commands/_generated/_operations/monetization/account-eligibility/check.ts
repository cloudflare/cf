/** @generated from generated:post:/{account_or_zone}/{account_or_zone_id}/monetization */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/monetization`,
	body: "json",
	constants: {
		acceptedTermsOfService: true,
	},
} as const;
