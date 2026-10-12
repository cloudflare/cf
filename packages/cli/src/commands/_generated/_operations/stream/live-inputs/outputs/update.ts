/** @generated from stream-live-inputs-update-an-output */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/live_inputs/${request.live_input_identifier}/outputs/${request.output_identifier}`,
	body: "json",
} as const;
