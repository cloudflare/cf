/** @generated from dlp-datasets-read */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/datasets/${request.dataset_id}`,
} as const;
