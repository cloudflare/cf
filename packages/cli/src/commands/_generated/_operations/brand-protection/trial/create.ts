/** @generated from post_DomainTrial */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/brand-protection/domain/trial`,
	body: "json",
	errors: {
		403: "ForbiddenError",
		502: "BadGatewayError",
		503: "ServiceUnavailableError",
	},
} as const;
