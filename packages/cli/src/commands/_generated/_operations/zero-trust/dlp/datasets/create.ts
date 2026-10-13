/** @generated from zero-trust.dlp.datasets.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/datasets`,
	body: "json",
} as const;
