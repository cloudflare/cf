/** @generated from cloudflare-images-image-details */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/${request.image_id}`,
} as const;
