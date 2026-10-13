/** @generated from realtime.turn.keys.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/turn_keys`,
	body: "json",
} as const;
