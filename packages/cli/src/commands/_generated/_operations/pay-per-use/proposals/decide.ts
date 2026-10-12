/** @generated from pay-per-crawl.postPPUProposalDecision */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-use/proposals`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
