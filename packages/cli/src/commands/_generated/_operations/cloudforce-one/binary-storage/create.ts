/** @generated from post_BinDBPost */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/binary`,
	pathParams: ["account_id"],
	body: "form",
	errors: {
		400: "BadRequestError",
	},
} as const;
