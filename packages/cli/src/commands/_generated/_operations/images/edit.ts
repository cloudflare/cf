/** @generated from cloudflare-images-update-image */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/${request.image_id}`,
	body: "json",
} as const;
