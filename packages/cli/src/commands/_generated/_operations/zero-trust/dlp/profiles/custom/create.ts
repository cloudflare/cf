/** @generated from dlp-profiles-create-custom-profiles */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/profiles/custom`,
	body: "json",
} as const;
