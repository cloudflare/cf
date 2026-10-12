/** @generated from brapi-post_DevtoolsAcquire */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/devtools/browser`,
	query: [
		"keep_alive",
		"lab",
		"targets",
		"liveViewUrlExpiresInMs",
		"recording",
	],
	body: "json",
	errors: {
		429: "TooManyRequestsError",
	},
} as const;
