import { createCommandClient, requestApi } from "#lib/auth.js";
import { parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * respond command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 user invites respond <invite-id>\n\nResponds to an invitation.")
		.positional("invite-id", {
			type: "string",
			description: "Invite identifier tag.",
			demandOption: true,
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description: "Raw JSON request body (bypasses individual flags)",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"user'-s-invites-respond-to-invitation">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "respond <invite-id>",
	describe: "Respond to Invitation",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user invites respond",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf user invites respond",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/user/invites/${argv["invite-id"] == null ? "<invite-id>" : encodeURIComponent(String(argv["invite-id"]))}`,
						pathParams: { "invite-id": String(argv["invite-id"] ?? "") },
						bodyKind: "json",
						body: argv.body !== undefined ? parseBody(argv.body) : undefined,
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.user.invites.respond({
							...bodyData,
							invite_id: argv["invite-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}

				const result = await withProgress(`Updating`, async () =>
					requestApi<unknown>(
						client,
						"PATCH",
						`/user/invites/${encodeURIComponent(String(argv["invite-id"]))}`
					)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
