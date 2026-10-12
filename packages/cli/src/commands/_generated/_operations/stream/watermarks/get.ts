/** @generated from stream-watermark-profile-watermark-profile-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/watermarks/${request.identifier}`,
} as const;
