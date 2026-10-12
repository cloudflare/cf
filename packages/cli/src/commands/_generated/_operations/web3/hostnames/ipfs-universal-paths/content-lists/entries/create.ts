/** @generated from web3-hostname-create-ipfs-universal-path-gateway-content-list-entry */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames/${request.identifier}/ipfs_universal_path/content_list/entries`,
	body: "json",
} as const;
