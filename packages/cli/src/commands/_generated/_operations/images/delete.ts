/** @generated from images.delete */
import { path } from "#api";

export default {
	method: "DELETE",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/images/v1/${request.image_id}`,
} as const;
