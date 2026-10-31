/** @generated from zero-trust.dlp.validators.proximity-words.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/proximity_words/${request.validator_id}`,
} as const;
