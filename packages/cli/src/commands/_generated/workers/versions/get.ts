/**
 * get command
 * @generated from apis/overlays/workers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Identifier for the Worker, which can be ID or name.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		include: {
			kind: "enum",
			brief:
				"Optional properties to include in the response. `modules` includes the `modules` property, which contains code and may add several megabytes to the response size. `modules,sourcemaps` also includes the version's source maps in `modules`.",
			values: ["modules", "modules,sourcemaps"],
			optional: true,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "version-id",
			brief:
				'Identifier for the version, which can be a UUID, a UUID prefix (minimum length 8), or the literal "latest" to operate on the most recently created version.',
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "get <version-id>",
	describe: "Get Worker Version",
	usage:
		"$0 workers versions get <version-id>\n\nGet details about a specific Worker version.",
	...parameters,
	loader: () => import("./get.handler.js"),
});

export default command;
