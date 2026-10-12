/** @generated from web3-hostname-list-web3-hostnames */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames`,
} as const;
