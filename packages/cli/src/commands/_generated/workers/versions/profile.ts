/**
 * profile command
 * @generated from apis/overlays/workers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		worker: {
			kind: "parsed",
			brief: "Identifies the Worker by ID or name.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		"actor-id": {
			kind: "parsed",
			brief:
				"Identifies the exact Durable Object actor to profile. Must be specified together with namespace_id. The actor must currently be active and running the requested version.",
			optional: true,
			parse: String,
		},
		"duration-ms": {
			kind: "parsed",
			brief: "Profile duration in milliseconds.",
			optional: true,
			parse: Number,
		},
		"namespace-id": {
			kind: "parsed",
			brief:
				"Identifies the Durable Object namespace containing the actor to profile. Must be specified together with actor_id.",
			optional: true,
			parse: String,
		},
		"profile-type": {
			kind: "parsed",
			brief: "The profile_type field",
			default: "cpu",
			choices: ["cpu", "heap"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "profile-type", "text"),
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
		text: {
			kind: "boolean",
			brief:
				"Decode the response body as UTF-8 text instead of writing raw bytes",
			default: false,
		},
	},
	operands: [
		{
			placeholder: "version-id",
			brief:
				'Identifies the version by UUID or UUID prefix with a minimum length of eight characters. Use "latest" to select the most recently created version, which may not be deployed. Use "latest-deployed" to profile a version in the active deployment. Versions are tried in order of traffic share until one has a loaded isolate.',
			parse: String,
		},
	],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "profile <version-id>",
	describe: "Profile Worker Version",
	usage:
		"$0 workers versions profile <version-id>\n\nCaptures a CPU or heap profile from a recently active isolate running the specified Worker version. This endpoint requires the Worker profiling feature to be enabled for the account.",
	...parameters,
	loader: () => import("./profile.handler.js"),
});

export default command;
