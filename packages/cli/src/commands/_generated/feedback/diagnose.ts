import operation from "../_operations/feedback/diagnose.js";
/**
 * diagnose command
 * @generated from apis/overlays/feedback.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "diagnose",
	describe: "Get the project feedback prompt",
	usage:
		"$0 feedback diagnose\n\nReturns the Cloudflare team's whole-project feedback prompt. An agent follows `instructions` to review how the user's project uses Cloudflare and write a report on what got in the way, shows the user the full report, and sends it with `POST /feedback/send` once the user approves.",
	flags: {
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
				command: "feedback diagnose",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf feedback diagnose",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/feedback/diagnosis`,
						pathParams: {},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.send(operation)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
});

export default command;
