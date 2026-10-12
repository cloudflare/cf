/** @generated from stream-videos-initiate-video-uploads-using-tus */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream`,
	query: ["direct_user"],
	headers: [
		"Tus-Resumable",
		"Upload-Creator",
		"Upload-Length",
		"Upload-Metadata",
	],
	response: false,
} as const;
