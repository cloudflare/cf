/** @generated from zero-trust.dlp.validators.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/${request.validator_id}`,
} as const;
