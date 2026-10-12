/** @generated from magic-sites-site-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/sites/${request.site_id}`,
	headers: ["x-magic-new-hc-target"],
} as const;
