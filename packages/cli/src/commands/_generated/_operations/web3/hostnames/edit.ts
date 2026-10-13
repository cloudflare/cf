/** @generated from web3.hostnames.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames/${request.identifier}`,
	body: "json",
} as const;
