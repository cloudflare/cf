/** @generated from stream-live-inputs-create-a-live-input */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/live_inputs`,
	headers: ["Idempotency-Key"],
	body: "json",
} as const;
