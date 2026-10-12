/** @generated from dlp-profiles-update-custom-profile */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/profiles/custom/${request.profile_id}`,
	body: "json",
} as const;
