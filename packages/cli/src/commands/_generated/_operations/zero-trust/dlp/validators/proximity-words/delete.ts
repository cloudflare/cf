/** @generated from zero-trust.dlp.validators.proximity-words.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/proximity_words/${request.validator_id}`,
} as const;
