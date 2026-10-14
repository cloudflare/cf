/** @generated from magic-transit.pcaps.ownership.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/ownership`,
} as const;
