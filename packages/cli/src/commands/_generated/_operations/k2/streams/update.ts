/** @generated from patchV4AccountsByAccount_idK2StreamsByStream_id */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/k2/streams/${request.stream_id}`,
	body: "json",
} as const;
