/** @generated from sinkhole-config-update-sinkhole */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/sinkholes/${request.sinkhole_id}`,
	body: "json",
} as const;
