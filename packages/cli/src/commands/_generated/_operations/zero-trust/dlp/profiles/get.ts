/** @generated from dlp-profiles-get-dlp-profile */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/profiles/${request.profile_id}`,
} as const;
