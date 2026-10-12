/** @generated from pay-per-crawl.getPPUOperatorConfiguration */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-use/operator/configuration`,
	errors: {
		403: "ForbiddenError",
		404: "NotFoundError",
	},
} as const;
