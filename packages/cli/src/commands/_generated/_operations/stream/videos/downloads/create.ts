/** @generated from stream.videos.downloads.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/${request.identifier}/downloads/${request.download_type}`,
} as const;
