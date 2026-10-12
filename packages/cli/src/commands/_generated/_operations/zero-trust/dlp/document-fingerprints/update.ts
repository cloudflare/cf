/** @generated from dlp-document-fingerprints-update */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/document_fingerprints/${request.document_fingerprint_id}`,
	body: "json",
} as const;
