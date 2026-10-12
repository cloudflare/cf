/** @generated from stream-watermark-profile-list-watermark-profiles */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/watermarks`,
} as const;
