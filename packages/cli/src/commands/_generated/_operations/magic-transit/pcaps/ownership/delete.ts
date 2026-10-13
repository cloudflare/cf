/** @generated from magic-transit.pcaps.ownership.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps/ownership/${request.ownership_id}`,
	response: false,
} as const;
