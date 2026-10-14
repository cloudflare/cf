/** @generated from cloudforce-one.scans.config.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/scans/config/${request.config_id}`,
} as const;
