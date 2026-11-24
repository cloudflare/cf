/**
 * create command
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
			brief: "Name of the script.",
			optional: true,
			alias: ["script-name", "worker-id"],
			parse: String,
		},
		"bypass-deployment-checks": {
			kind: "boolean",
			brief:
				"If set to true, the deployment will be created even if normally blocked by something such rolling back to an older version when a secret has changed.",
			optional: true,
		},
		"durable-objects-code-update-mode": {
			kind: "parsed",
			brief:
				"How to apply Durable Object code updates. `immediate` resets active objects and applies the new code right away. `deferred` lets active objects keep running their current code until they hibernate or the maximum delay passes.",
			optional: true,
			choices: ["immediate", "deferred"],
			parse: String,
			coerce: (value: string) =>
				resolveFileToken(value, "durable-objects-code-update-mode", "text"),
		},
		"durable-objects-code-update-max-delay": {
			kind: "parsed",
			brief:
				"Maximum number of seconds, up to 86400, that an active Durable Object can keep running its current code before it resets and adopts the new code. Only valid with `deferred`. When omitted, the default maximum delay applies.",
			optional: true,
			parse: Number,
		},
		strategy: {
			kind: "parsed",
			brief:
				"Strategy for routing traffic across the listed versions. `percentage` splits traffic according to each version's `percentage`.",
			optional: true,
			choices: ["percentage"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "strategy", "text"),
		},
		versions: {
			kind: "parsed",
			brief:
				'Worker versions included in this deployment. Each object must contain a `version_id` UUID and a `percentage`; percentages across all objects must total 100. In the `cf` CLI, pass the entire array as one JSON value to `--versions`, either inline, for example `--versions \'[{"version_id":"023e105f-2a42-4f8b-a1c1-73f6a2a30c0f","percentage":100}]\'`, or from a JSON file with `--versions @versions.json`. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"percentage": number, "version_id": string}].',
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
	rules(rules) {
		rules.check((argv) => {
			const groupSet = [
				"durable-objects-code-update-mode",
				"durable-objects-code-update-max-delay",
			].some((k) => argv[k] !== undefined);
			if (!argv.body && groupSet) {
				const missing = ["durable-objects-code-update-mode"].filter(
					(k) => argv[k] === undefined
				);
				if (missing.length > 0) {
					throw new Error(
						`${missing.map((m) => "--" + m).join(", ")} ${missing.length === 1 ? "is" : "are"} required when one of --durable-objects-code-update-mode, --durable-objects-code-update-max-delay is set`
					);
				}
			}
			return true;
		});
	},
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Create Worker Deployment",
	usage:
		"$0 workers deployments create\n\nDeployments configure how [Worker Versions](https://developers.cloudflare.com/api/operations/worker-versions-list-versions) are deployed to traffic. A deployment can consist of multiple versions of a Worker.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
