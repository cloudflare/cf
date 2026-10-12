/** @generated from pay-per-crawl.postPPUPublisherPriceAction */
import { path } from "#api";

export default {
	method: "POST",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pay-per-use/operators/${request.operator_id}/price`,
	body: "json",
	errors: {
		400: "BadRequestError",
		403: "ForbiddenError",
		404: "NotFoundError",
		409: "ConflictError",
	},
} as const;
