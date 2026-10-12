/** @generated from stream-live-inputs-list-all-outputs-associated-with-a-specified-live-input */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/live_inputs/${request.live_input_identifier}/outputs`,
} as const;
