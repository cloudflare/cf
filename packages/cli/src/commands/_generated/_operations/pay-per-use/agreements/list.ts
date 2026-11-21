/** @generated from pay-per-use.agreements.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-use/agreements`,
	query: ["page", "per_page"],
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
	},
} as const;
