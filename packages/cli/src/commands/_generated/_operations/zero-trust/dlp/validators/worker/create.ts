/** @generated from zero-trust.dlp.validators.worker.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/worker`,
	body: "json",
} as const;
