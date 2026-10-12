/** @generated from stream-video-clipping-clip-videos-given-a-start-and-end-time */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/clip`,
	body: "json",
} as const;
