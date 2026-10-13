/** @generated from origin-post-quantum-encryption.get */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/cache/origin_post_quantum_encryption`,
} as const;
