/** @generated from email-routing.rules.catch-all.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/email/routing/rules/catch_all`,
	body: "json",
	errors: {
		400: "BadRequestError",
		422: "UnprocessableEntityError",
	},
} as const;
