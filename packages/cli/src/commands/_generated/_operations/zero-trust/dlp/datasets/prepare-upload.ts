/** @generated from dlp-datasets-create-version */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/datasets/${request.dataset_id}/upload`,
} as const;
