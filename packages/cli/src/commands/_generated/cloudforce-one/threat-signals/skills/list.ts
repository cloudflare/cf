/**
 * list command
 * @generated from apis/overlays/cloudforce-one.ts
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
			brief: "Page number (≥ 1, default 1).",
			optional: true,
			parse: Number,
		},
		"per-page": {
			kind: "parsed",
			brief: "Results per page (1–100, default 20).",
			optional: true,
			parse: Number,
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
	describe: "List Threat Signals skills",
	usage:
		"$0 cloudforce-one threat-signals skills list\n\nLists active Managed Default Skills and Custom Skills. Free Threat Signals accounts see active managed defaults only, with custom_skills_available: false.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
