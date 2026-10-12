/** @generated from post_EventGraphQLV2 */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/events/graphql`,
	errors: {
		400: "BadRequestError",
	},
} as const;
