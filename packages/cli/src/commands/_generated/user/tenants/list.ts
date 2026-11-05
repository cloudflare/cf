import operation from "../../_operations/user/tenants/list.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * list command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 user tenants list\n\nLists the Cloudflare tenants in which the authenticated user has direct membership using the legacy Tenant response shape. Use `GET /organizations` to list Organizations the user can access, including through hierarchy, using the modern Organization response shape."
		)
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List user tenants",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user tenants list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user tenants list",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/tenants`,
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
};

export default command;
