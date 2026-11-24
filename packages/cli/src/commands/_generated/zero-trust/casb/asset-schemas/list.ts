/**
 * list command
 * @generated from apis/overlays/zero-trust.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		vendor: {
			kind: "enum",
			brief:
				"Restrict the result to a single vendor. Unknown values return 400.",
			values: [
				"ANTHROPIC",
				"AWS",
				"BITBUCKET",
				"BOX",
				"CONFLUENCE",
				"DROPBOX",
				"GITHUB",
				"GOOGLE_CLOUD_PLATFORM",
				"GOOGLE_WORKSPACE",
				"JIRA",
				"MICROSOFT",
				"OPENAI",
				"SALESFORCE",
				"SERVICENOW",
				"SLACK",
				"WORKDAY",
				"ZOOM",
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
	describe: "List asset schemas",
	usage:
		"$0 zero-trust casb asset-schemas list\n\nReturns the catalog of asset classes available when authoring custom findings, grouped by vendor. Optionally filter to a single vendor with the `vendor` query parameter.",
	...parameters,
	loader: () => import("./list.handler.js"),
});

export default command;
