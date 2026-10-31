/** @generated from firewall.payload-logging.update */
import { path } from "#api";

export default {
	method: "PUT",
	path: (request: Record<string, unknown>) =>
		path`/${request.account_or_zone}/${request.account_or_zone_id}/firewall/payload_logging/key`,
	body: "json",
} as const;
