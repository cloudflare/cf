/** @generated from magic-cf1-sites-delete-cf1-site */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/magic/cf1_sites/${request.cf1_site_id}`,
} as const;
