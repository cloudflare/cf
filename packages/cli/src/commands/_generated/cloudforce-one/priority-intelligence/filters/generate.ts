/**
 * generate command
 * @generated from apis/overlays/cloudforce-one.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		requirement: {
			kind: "parsed",
			brief: "Natural-language Priority Intelligence Requirement.",
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
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "generate",
	describe: "Generate event filters from a PIR",
	usage:
		"$0 cloudforce-one priority-intelligence filters generate\n\nTranslates a natural-language Priority Intelligence Requirement into Threat Events `searchBranches` with Workers AI. Terms that cannot be expressed as event filters are returned in `unresolved_terms`. Nothing is stored or executed.",
	...parameters,
	loader: () => import("./generate.handler.js"),
});

export default command;
