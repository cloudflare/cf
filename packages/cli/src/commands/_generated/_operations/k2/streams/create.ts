/** @generated from k2.streams.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/k2/streams`,
	body: "json",
} as const;
