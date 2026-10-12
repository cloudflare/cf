/** @generated from dlp-document-fingerprints-delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/document_fingerprints/${request.document_fingerprint_id}`,
	response: false,
} as const;
