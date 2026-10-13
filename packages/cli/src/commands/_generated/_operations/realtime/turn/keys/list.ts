/** @generated from realtime.turn.keys.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/turn_keys`,
} as const;
