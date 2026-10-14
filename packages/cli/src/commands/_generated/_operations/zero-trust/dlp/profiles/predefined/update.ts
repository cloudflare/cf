/** @generated from zero-trust.dlp.profiles.predefined.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/profiles/predefined/${request.profile_id}`,
	body: "json",
} as const;
