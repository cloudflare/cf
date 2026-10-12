/** @generated from dlp-document-fingerprints-read-all */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/document_fingerprints`,
} as const;
