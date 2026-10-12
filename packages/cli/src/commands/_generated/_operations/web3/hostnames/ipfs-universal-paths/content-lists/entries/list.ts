/** @generated from web3-hostname-list-ipfs-universal-path-gateway-content-list-entries */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames/${request.identifier}/ipfs_universal_path/content_list/entries`,
} as const;
