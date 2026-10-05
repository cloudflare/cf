import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * userMembershipsGet command
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
			"$0 user memberships userMembershipsGet <membership-id>\n\nGet a specific membership for the currently authenticated user."
		)
		.positional("membership-id", {
			type: "string",
			description: "Membership identifier tag.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"user-memberships-get">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "userMembershipsGet <membership-id>",
	describe: "Get User Membership",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user memberships userMembershipsGet",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user memberships userMembershipsGet",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/user/memberships/${argv["membership-id"] == null ? "<membership-id>" : encodeURIComponent(String(argv["membership-id"]))}`,
						pathParams: {
							"membership-id": String(argv["membership-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.user.memberships.userMembershipsGet({
						membership_id: argv["membership-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
