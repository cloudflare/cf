/** @generated from zero-trust.dlp.profiles.list */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dlp/profiles`,
	query: ["all"],
} as const;
