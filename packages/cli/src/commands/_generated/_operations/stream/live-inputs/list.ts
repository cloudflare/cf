/** @generated from stream-live-inputs-list-live-inputs */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/stream/live_inputs`,
	query: ["include_counts"],
} as const;
