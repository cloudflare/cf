/** @generated from web3-hostname-create-web3-hostname */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames`,
	body: "json",
} as const;
