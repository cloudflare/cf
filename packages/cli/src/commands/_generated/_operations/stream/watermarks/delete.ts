/** @generated from stream-watermark-profile-delete-watermark-profiles */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/watermarks/${request.identifier}`,
} as const;
