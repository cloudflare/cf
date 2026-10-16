/** @generated from zero-trust.dlp.validators.worker.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/worker/${request.validator_id}`,
	body: "json",
} as const;
