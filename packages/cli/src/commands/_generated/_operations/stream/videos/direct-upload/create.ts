/** @generated from stream-videos-upload-videos-via-direct-upload-ur-ls */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/direct_upload`,
	headers: ["Upload-Creator"],
	body: "json",
} as const;
