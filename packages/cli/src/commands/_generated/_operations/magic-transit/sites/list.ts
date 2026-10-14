/** @generated from magic-transit.sites.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites`,
	query: ["connectorid"],
} as const;
