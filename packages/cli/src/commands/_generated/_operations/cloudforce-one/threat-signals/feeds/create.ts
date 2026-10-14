/** @generated from cloudforce-one.threat-signals.feeds.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/threat-signals/feeds`,
	body: "json",
	errors: {
		403: "ForbiddenError",
		503: "ServiceUnavailableError",
	},
} as const;
