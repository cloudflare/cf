/** @generated from web3.hostnames.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames/${request.identifier}`,
} as const;
