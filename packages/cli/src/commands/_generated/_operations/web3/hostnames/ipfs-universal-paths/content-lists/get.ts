/** @generated from web3-hostname-ipfs-universal-path-gateway-content-list-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames/${request.identifier}/ipfs_universal_path/content_list`,
} as const;
