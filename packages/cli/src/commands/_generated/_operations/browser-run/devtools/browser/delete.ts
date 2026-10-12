/** @generated from brapi-delete_DevtoolsBrowserDelete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/devtools/browser/${request.session_id}`,
	errors: {
		404: "NotFoundError",
	},
} as const;
