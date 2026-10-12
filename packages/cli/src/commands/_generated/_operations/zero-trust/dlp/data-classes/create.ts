/** @generated from dlp-data-classes-create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/data_classes`,
	body: "json",
} as const;
