/** @generated from stream.videos.direct-upload.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/direct_upload`,
	headers: ["Upload-Creator"],
	body: "json",
} as const;
