/** @generated from stream-live-inputs-delete-an-output */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/live_inputs/${request.live_input_identifier}/outputs/${request.output_identifier}`,
} as const;
