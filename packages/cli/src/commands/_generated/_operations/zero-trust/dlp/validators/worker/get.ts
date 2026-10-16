/** @generated from zero-trust.dlp.validators.worker.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/worker/${request.validator_id}`,
} as const;
