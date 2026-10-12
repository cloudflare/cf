/** @generated from web3-hostname-delete-ipfs-universal-path-gateway-content-list-entry */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames/${request.identifier}/ipfs_universal_path/content_list/entries/${request.content_list_entry_identifier}`,
} as const;
