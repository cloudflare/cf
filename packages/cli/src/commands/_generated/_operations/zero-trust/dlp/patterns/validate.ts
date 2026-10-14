/** @generated from zero-trust.dlp.patterns.validate */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/patterns/validate`,
	body: "json",
} as const;
