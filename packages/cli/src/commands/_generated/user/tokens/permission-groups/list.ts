import operation from "../../../_operations/user/tokens/permission-groups/list.js";
/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "list",
	describe: "List Token Permission Groups",
	usage:
		"$0 user tokens permission-groups list\n\nFind all available permission groups for API Tokens.",
	flags: {
		name: {
			kind: "parsed",
			brief:
				"Filter by the name of the permission group.\nThe value must be URL-encoded.",
			optional: true,
			parse: String,
		},
		scope: {
			kind: "parsed",
			brief:
				"Filter by the scope of the permission group.\nThe value must be URL-encoded.",
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user tokens permission-groups list",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Record<string, unknown> = {
					name: argv["name"],
					scope: argv["scope"],
				};
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user tokens permission-groups list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/tokens/permission_groups`,
						pathParams: {},
						query: queryParams,
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation, queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
