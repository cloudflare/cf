/** @generated from dlp-profiles-delete-custom-profile */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/profiles/custom/${request.profile_id}`,
} as const;
