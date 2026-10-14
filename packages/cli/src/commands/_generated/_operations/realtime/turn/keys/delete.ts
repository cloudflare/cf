/** @generated from realtime.turn.keys.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/calls/turn_keys/${request.key_id}`,
} as const;
