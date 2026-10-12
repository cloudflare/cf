/** @generated from ip-address-management-prefixes-download-loa-document */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/addressing/loa_documents/${request.loa_document_id}/download`,
	response: "binary-response",
} as const;
