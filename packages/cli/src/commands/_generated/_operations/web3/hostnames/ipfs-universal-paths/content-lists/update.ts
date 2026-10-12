/** @generated from web3-hostname-update-ipfs-universal-path-gateway-content-list */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames/${request.identifier}/ipfs_universal_path/content_list`,
	body: "json",
	constants: {
		action: "block",
	},
} as const;
