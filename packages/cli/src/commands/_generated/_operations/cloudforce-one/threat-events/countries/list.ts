/** @generated from get_CountryRead */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/countries`,
	errors: {
		400: "BadRequestError",
	},
} as const;
