/** @generated from rum.site-info.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/rum/site_info/${request.site_id}`,
} as const;
