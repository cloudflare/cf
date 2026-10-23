/** @generated from cloudforce-one.priority-intelligence.matches.aggregate-all */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/v2/priority-intelligence/matches/aggregate`,
	query: ["aggregate_by", "limit", "since", "triage_state", "include_backfill"],
	errors: {
		400: "BadRequestError",
	},
} as const;
