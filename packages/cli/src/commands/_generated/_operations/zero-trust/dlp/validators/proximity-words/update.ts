/** @generated from zero-trust.dlp.validators.proximity-words.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/proximity_words/${request.validator_id}`,
	body: "json",
} as const;
