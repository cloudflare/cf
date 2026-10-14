/** @generated from web3.hostnames.ipfs-universal-paths.content-lists.entries.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/web3/hostnames/${request.identifier}/ipfs_universal_path/content_list/entries/${request.content_list_entry_identifier}`,
	body: "json",
} as const;
