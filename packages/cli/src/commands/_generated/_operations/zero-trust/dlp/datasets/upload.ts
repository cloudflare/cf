/** @generated from dlp-datasets-upload-version */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/datasets/${request.dataset_id}/upload/${request.version}`,
	body: "json",
	contentType: "application/octet-stream",
} as const;
