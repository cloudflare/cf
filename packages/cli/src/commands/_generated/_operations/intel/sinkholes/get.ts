/** @generated from intel.sinkholes.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/intel/sinkholes/${request.sinkhole_id}`,
} as const;
