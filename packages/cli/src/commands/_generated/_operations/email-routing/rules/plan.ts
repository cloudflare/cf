/** @generated from email-routing.rules.plan */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/email/routing/rules/plan`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		422: "UnprocessableEntityError",
	},
} as const;
