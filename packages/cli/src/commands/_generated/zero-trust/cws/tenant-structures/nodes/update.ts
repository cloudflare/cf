/**
 * update command
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
		name: {
			kind: "parsed",
			brief:
				"Display name (e.g. an OU or account name), mutable. Optional; empty by default.",
			optional: true,
			parse: String,
		},
		"native-id": {
			kind: "parsed",
			brief:
				"Cloud-native identifier of this node, unique within the structure; the parent-reference target. Shape depends on the structure's application. Immutable after create.",
			optional: true,
			parse: String,
		},
		"node-kind": {
			kind: "parsed",
			brief:
				"Position in the tree. Legal values depend on the structure's application (aws: root/ou/account; cloudflare: org/account/zone). At most one root per structure. Immutable after create.",
			optional: true,
			parse: String,
		},
		parent: {
			kind: "parsed",
			brief:
				"Native ID of this node's parent. Required for non-root nodes and omitted for the root. The parent must be in the same structure and able to contain this node kind.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "node-id",
			brief: "ID of the node to update",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "update <node-id>",
	describe: "Update a tenant node",
	usage:
		"$0 zero-trust cws tenant-structures nodes update <node-id>\n\nUpdates the node's display name or parent while preserving its immutable identity fields.",
	...parameters,
	loader: () => import("./update.handler.js"),
});

export default command;
