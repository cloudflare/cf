/** @generated from k2.streams.update */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/k2/streams/${request.stream_id}`,
	body: "json",
} as const;
