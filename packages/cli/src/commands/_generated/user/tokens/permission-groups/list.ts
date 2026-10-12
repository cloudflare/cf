import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkQuery } from "#sdk";
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
			"$0 user tokens permission-groups list\n\nFind all available permission groups for API Tokens."
		)
		.option("name", {
			type: "string",
			description:
				"Filter by the name of the permission group.\nThe value must be URL-encoded.",
		})
		.option("scope", {
			type: "string",
			description:
				"Filter by the scope of the permission group.\nThe value must be URL-encoded.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Query = SdkQuery<"permission-groups-list-permission-groups">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "list",
	describe: "List Token Permission Groups",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user tokens permission-groups list",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				const queryParams: Query = {
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
					client.user.tokens.permissionGroups.list(queryParams)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
