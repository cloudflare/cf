/** @generated from zero-trust.dlp.validators.proximity-words.create */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/proximity_words`,
	body: "json",
} as const;
