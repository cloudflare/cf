/** @generated from zones.binary-ast.edit */
import { path } from "#api";

export default {
	method: "PATCH",
	path: (request: Record<string, unknown>) =>
		path`/zones/${request.zone_id}/settings/binary_ast`,
	body: "json",
} as const;
