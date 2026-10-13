/** @generated from browser-run.devtools.browser.targets.activate */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/devtools/browser/${request.session_id}/json/activate/${request.target_id}`,
	errors: {
		400: "BadRequestError",
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
