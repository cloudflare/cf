/** @generated from ip-address-management-prefixes-list-loa-documents */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/loa_documents`,
} as const;
