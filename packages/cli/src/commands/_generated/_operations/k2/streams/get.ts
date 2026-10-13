/** @generated from k2.streams.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/k2/streams/${request.stream_id}`,
} as const;
