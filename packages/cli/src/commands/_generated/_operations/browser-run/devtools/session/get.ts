/** @generated from browser-run.devtools.session.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/devtools/session/${request.session_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
