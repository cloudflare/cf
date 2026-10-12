/** @generated from calls-retrieve-turn-key-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/turn_keys/${request.key_id}`,
} as const;
