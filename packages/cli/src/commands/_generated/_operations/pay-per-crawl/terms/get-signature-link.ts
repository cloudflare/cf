/** @generated from pay-per-crawl.getTermsSignatureLink */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/pay-per-crawl/signature_link`,
	errors: {
		400: "BadRequestError",
	},
} as const;
