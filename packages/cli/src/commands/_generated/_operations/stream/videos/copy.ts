/** @generated from stream-videos-upload-videos-from-a-url */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/copy`,
	headers: ["Upload-Creator"],
	body: "json",
} as const;
