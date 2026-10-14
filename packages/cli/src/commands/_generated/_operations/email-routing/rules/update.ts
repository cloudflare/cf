/** @generated from email-routing.rules.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing/rules/${request.rule_identifier}`,
	body: "json",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
	},
} as const;
