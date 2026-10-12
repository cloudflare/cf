/** @generated from dlp-document-fingerprints-read */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/document_fingerprints/${request.document_fingerprint_id}`,
} as const;
