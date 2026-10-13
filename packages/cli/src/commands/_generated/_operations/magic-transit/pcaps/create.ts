/** @generated from magic-transit.pcaps.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pcaps`,
	body: "json",
} as const;
