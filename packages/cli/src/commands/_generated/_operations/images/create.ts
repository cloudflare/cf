/** @generated from cloudflare-images-upload-an-image-via-url */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1`,
	pathParams: ["account_id"],
	body: "form",
} as const;
