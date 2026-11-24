/**
 * create command
 * @generated from apis/overlays/workers-for-platforms.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		name: {
			kind: "parsed",
			brief: "The name of the dispatch namespace.",
			optional: true,
			parse: String,
		},
		"trusted-workers": {
			kind: "boolean",
			brief:
				'Whether the Workers in the namespace are executed in a "trusted" manner. When a Worker is trusted, it has access to the shared caches for the zone in the Cache API, and has access to the `request.cf` object on incoming Requests. When a Worker is untrusted, caches are not shared across the zone, and `request.cf` is undefined. By default, Workers in a namespace are "untrusted".',
			default: false,
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Workers for Platforms Dispatch Namespace",
	usage:
		"$0 workers-for-platforms dispatch-namespaces create\n\nCreate a new Workers for Platforms dispatch namespace.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
