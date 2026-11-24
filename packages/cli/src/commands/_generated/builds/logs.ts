/**
 * logs command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		cursor: {
			kind: "parsed",
			brief: "Pagination cursor for log retrieval.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "build-uuid",
			brief: "UUID of the build, as returned by builds list.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "logs <build-uuid>",
	describe: "Get Workers build logs",
	usage:
		"$0 builds logs <build-uuid>\n\nRetrieve cursor-paginated log lines for a build UUID.",
	...parameters,
	loader: () => import("./logs.handler.js"),
});

export default command;
