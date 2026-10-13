/** @generated from magic-transit.pcaps.ownership.validate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/ownership/validate`,
	body: "json",
} as const;
