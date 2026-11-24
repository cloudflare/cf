/**
 * delete command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"dispatch-namespace": {
			kind: "parsed",
			brief: "Name of the Workers for Platforms dispatch namespace.",
			parse: String,
		},
		"script-name": {
			kind: "parsed",
			brief: "Name of the script.",
			parse: String,
		},
		"api-version": {
			kind: "parsed",
			brief:
				"Requested API compatibility date in `YYYY-MM-DD[.release]` format (UTC). The optional release suffix contains lowercase letters; for example, `2026-10-01.epoch`.\n\nTyped Worker tag operations require a date on or after `2026-10-01`.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		force: {
			kind: "boolean",
			brief: "Skip confirmation (useful in scripts and CI)",
			alias: "f",
			default: false,
		},
	},
	operands: [{ placeholder: "tag", brief: "Tag", parse: String }],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "delete <tag>",
	describe: "Delete Workers for Platforms Script Tag",
	usage:
		"$0 workers-for-platforms dispatch-namespaces scripts tags delete <tag>\n\nDelete a tag from a script uploaded to a Workers for Platforms dispatch namespace. On `api-version` dates on or after `2026-10-01`, `tag` identifies a key and the operation returns the complete updated tag map. Deleting a missing key succeeds. Earlier versions retain the legacy string-tag behavior and return a null result.",
	...parameters,
	loader: () => import("./delete.handler.js"),
});

export default command;
