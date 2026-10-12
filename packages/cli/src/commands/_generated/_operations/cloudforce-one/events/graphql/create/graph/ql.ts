/** @generated from post_EventGraphQL */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/events/graphql`,
	errors: {
		400: "BadRequestError",
	},
} as const;
