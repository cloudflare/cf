/** @generated from magic-transit.pcaps.ownership.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/ownership`,
	body: "json",
} as const;
