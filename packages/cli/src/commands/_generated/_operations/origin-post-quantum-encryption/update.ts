/** @generated from origin-post-quantum-encryption.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/origin_post_quantum_encryption`,
	body: "json",
} as const;
