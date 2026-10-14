/** @generated from stream.watermarks.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/watermarks`,
	body: "json",
} as const;
