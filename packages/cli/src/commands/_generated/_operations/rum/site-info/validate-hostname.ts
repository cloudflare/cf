/** @generated from rum.site-info.validate-hostname */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info/validate/${request.hostname}`,
} as const;
