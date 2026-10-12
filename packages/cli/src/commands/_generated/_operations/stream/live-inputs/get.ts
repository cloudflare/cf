/** @generated from stream-live-inputs-retrieve-a-live-input */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/live_inputs/${request.live_input_identifier}`,
} as const;
