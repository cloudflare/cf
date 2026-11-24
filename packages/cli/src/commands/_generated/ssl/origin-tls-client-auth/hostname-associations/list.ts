/**
 * list command
 * @generated from apis/overlays/ssl.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		page: {
			kind: "parsed",
			brief: "Page number of paginated results.",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Number of associations per page.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief:
				'Filter associations by status. Use comma-separated values to filter by multiple statuses, or "all" to include every status. Defaults to "active" if not provided.',
			values: [
				"active",
				"pending_deployment",
				"pending_deletion",
				"deleted",
				"deployment_timed_out",
				"deletion_timed_out",
				"all",
			],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "list",
	describe: "List Hostname Associations",
	usage:
		"$0 ssl origin-tls-client-auth hostname-associations list\n\nList certificate ID - hostname associations for the given zone. Shows which hostnames are associated to which certificates for authenticated origin pulls.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
