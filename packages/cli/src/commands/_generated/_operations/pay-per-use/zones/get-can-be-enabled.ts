/** @generated from pay-per-use.zones.get-can-be-enabled */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/pay-per-use/can_be_enabled`,
	errors: {
		403: "ForbiddenError",
	},
} as const;
