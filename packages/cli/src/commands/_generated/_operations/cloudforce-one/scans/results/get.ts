/** @generated from get_GetOpenPorts */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/scans/results/${request.config_id}`,
} as const;
