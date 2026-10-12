/** @generated from zone-settings-get-binary-ast-setting */
import { path } from "#api";

export default {
	method: "GET",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/binary_ast`,
} as const;
