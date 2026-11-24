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
			brief: "Number of certificate packs per page.",
			optional: true,
			parse: Number,
		},
		status: {
			kind: "enum",
			brief: "Include Certificate Packs of all statuses, not just active ones.",
			values: ["all"],
			optional: true,
		},
		deploy: {
			kind: "enum",
			brief: "Specify the deployment environment for the certificate packs.",
			values: ["staging", "production"],
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
	describe: "List Certificate Packs",
	usage:
		"$0 ssl certificate-packs list\n\nFor a given zone, list all active certificate packs.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
