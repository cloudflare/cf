/** @generated from stream-videos-delete-video */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}`,
	response: false,
} as const;
