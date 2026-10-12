/** @generated from realtime.turn.keys.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/turn_keys/${request.key_id}`,
	body: "json",
} as const;
