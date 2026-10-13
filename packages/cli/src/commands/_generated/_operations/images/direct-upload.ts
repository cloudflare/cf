/** @generated from images.direct-upload */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v2/direct_upload`,
	pathParams: ["account_id"],
	body: "form",
} as const;
