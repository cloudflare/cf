/** @generated from get_BinDBGetBinary */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/cloudforce-one/binary/${request.hash}`,
	response: false,
	errors: {
		400: "BadRequestError",
	},
} as const;
