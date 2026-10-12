/** @generated from cloudflare-images-base-image */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/${request.image_id}/blob`,
	response: "binary-response",
} as const;
