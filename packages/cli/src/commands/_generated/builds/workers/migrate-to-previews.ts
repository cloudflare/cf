/**
 * migrate-to-previews command
 * @generated from apis/overlays/builds.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";

const parameters = {
	flags: {
		"deploy-command": {
			kind: "parsed",
			brief:
				"Deploy command for the migrated Preview settings. Omit it to have the existing 'wrangler versions upload' command rewritten to 'wrangler preview' automatically, which fails with 400 when the existing command cannot be rewritten.",
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
			brief:
				"Request body for migrating a Worker's legacy non-production trigger to Previews.",
			optional: true,
			parse: String,
		},
	},
	operands: [
		{
			placeholder: "worker",
			brief: "Script tag of the Worker.",
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "migrate-to-previews <worker>",
	describe: "Migrate worker to previews",
	usage:
		"$0 builds workers migrate-to-previews <worker>\n\nMigrate a Worker's legacy non-production trigger to Previews. The legacy build settings become the Previews base config and the legacy trigger is removed.",
	...parameters,
	loader: () => import("./migrate-to-previews.handler.js"),
});

export default command;
