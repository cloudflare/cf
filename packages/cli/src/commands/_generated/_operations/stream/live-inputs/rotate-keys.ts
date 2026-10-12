/** @generated from stream-live-inputs-rotate-keys-for-a-live-input */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/live_inputs/${request.live_input_identifier}/rotate_keys`,
} as const;
