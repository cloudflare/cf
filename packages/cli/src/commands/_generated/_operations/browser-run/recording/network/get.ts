/** @generated from browser-run.recording.network.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/browser-rendering/recording/${request.session_id}/network`,
	query: ["format", "target"],
	errors: {
		404: "NotFoundError",
		500: "InternalServerError",
	},
} as const;
