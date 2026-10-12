/** @generated from dex-fleet-status-devices */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/accounts/${request.account_id}/dex/fleet-status/devices`,
	query: [
		"to",
		"from",
		"page",
		"per_page",
		"sort_by",
		"colo",
		"device_id",
		"mode",
		"status",
		"platform",
		"version",
		"source",
	],
} as const;
