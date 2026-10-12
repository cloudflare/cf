/** @generated from brapi-put_DevtoolsJsonNew */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/devtools/browser/${request.session_id}/json/new`,
	query: ["url", "liveViewUrlExpiresInMs"],
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
