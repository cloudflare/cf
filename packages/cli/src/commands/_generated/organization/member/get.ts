import { createCommandClient } from "#lib/auth.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * get command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organization member get <member-id>\n\nRetrieve a single membership from an Organization. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.positional("member-id", {
			type: "string",
			description: "Organization Member ID",
			demandOption: true,
		})
		.option("organization-id", {
			type: "string",
			description: "Organization ID",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"Members_retrieve">;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "get <member-id>",
	describe: "Get organization member",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization member get",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization member get",
						method: "GET",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/members/${argv["member-id"] == null ? "<member-id>" : encodeURIComponent(String(argv["member-id"]))}`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
							"member-id": String(argv["member-id"] ?? ""),
						},
						bodyKind: "none",
					});
					return;
				}
				const client = await createCommandClient(argv);

				const result = await withProgress(`Loading`, async () =>
					client.organization.member.get({
						organization_id: argv["organization-id"],
						member_id: argv["member-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Loaded` });
			}
		),
};

export default command;
