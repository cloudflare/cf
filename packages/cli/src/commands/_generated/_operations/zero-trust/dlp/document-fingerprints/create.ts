/** @generated from zero-trust.dlp.document-fingerprints.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/document_fingerprints`,
	body: "json",
} as const;
