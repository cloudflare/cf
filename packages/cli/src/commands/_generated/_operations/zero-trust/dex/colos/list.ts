/** @generated from zero-trust.dex.colos.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/colos`,
	query: ["from", "to", "sortBy"],
} as const;
