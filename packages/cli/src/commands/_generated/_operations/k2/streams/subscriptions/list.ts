/** @generated from getV4AccountsByAccount_idK2StreamsByStream_idSubscriptions */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/k2/streams/${request.stream_id}/subscriptions`,
} as const;
