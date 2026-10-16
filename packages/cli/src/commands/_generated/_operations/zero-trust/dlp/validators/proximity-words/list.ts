/** @generated from zero-trust.dlp.validators.proximity-words.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/validators/proximity_words`,
} as const;
