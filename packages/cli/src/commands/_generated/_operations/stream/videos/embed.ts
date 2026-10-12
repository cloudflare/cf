/** @generated from stream.videos.embed */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/embed`,
	response: "text",
} as const;
