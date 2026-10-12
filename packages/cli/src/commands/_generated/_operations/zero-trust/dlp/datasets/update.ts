/** @generated from dlp-datasets-update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/datasets/${request.dataset_id}`,
	body: "json",
} as const;
