/** @generated from browser-run.devtools.browser.version */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/devtools/browser/${request.session_id}/json/version`,
	errors: {
		400: "BadRequestError",
		500: "InternalServerError",
	},
} as const;
