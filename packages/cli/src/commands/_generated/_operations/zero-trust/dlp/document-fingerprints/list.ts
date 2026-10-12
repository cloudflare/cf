/** @generated from zero-trust.dlp.document-fingerprints.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/document_fingerprints`,
} as const;
