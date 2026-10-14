/** @generated from stream.videos.captions.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/captions`,
} as const;
