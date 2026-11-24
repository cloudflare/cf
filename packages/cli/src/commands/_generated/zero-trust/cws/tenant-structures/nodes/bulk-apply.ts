/**
 * bulk-apply command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"structure-id": {
			kind: "parsed",
			brief: "ID of the parent tenant structure",
			parse: String,
		},
		creates: {
			kind: "parsed",
			brief:
				'Nodes to create; parents may be created elsewhere in this request. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"native_id": string, "node_kind": string, "name"?: string, "parent"?: string}]. ? marks optional keys.',
			optional: true,
			parse: String,
		},
		deletes: {
			kind: "parsed",
			brief:
				'Nodes to delete; every descendant that will not be reparented must also be deleted. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string}].',
			optional: true,
			parse: String,
		},
		updates: {
			kind: "parsed",
			brief:
				'Nodes whose mutable fields should be fully replaced. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"id": string, "name"?: string, "parent"?: string}]. ? marks optional keys.',
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
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "bulk-apply",
	describe: "Apply a batch of tenant node mutations",
	usage:
		"$0 zero-trust cws tenant-structures nodes bulk-apply\n\nAtomically validates and applies 1 to 500 unordered node operations. Creates may reference new parents but cannot reuse a native_id deleted in the same batch. Maximum body size: 1 MiB.",
	...parameters,
	loader: () => import("./bulk-apply.handler.js"),
});

export default command;
