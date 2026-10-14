import operation from "../../_operations/user/invites/respond.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * respond command
 * @generated from apis/overlays/user.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage("$0 user invites respond <invite-id>\n\nResponds to an invitation.")
		.positional("invite-id", {
			type: "string",
			description: "Invite identifier tag.",
			demandOption: true,
		})
		.option("status", {
			type: "string",
			description:
				"Status of your response to the invitation (rejected or accepted).",
			choices: ["accepted", "rejected"],
		})
		.coerce("status", (value) => resolveFileToken(value, "status", "text"))
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "respond <invite-id>",
	describe: "Respond to Invitation",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "user invites respond",
				classification: {
					safeFlags: ["status", "dry-run"],
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
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										status: argv["status"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, {
							body: bodyData,
							invite_id: argv["invite-id"],
						})
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["status"] === undefined) {
					argv["status"] = await promptForRequiredEnumField(
						"status",
						"Status of your response to the invitation (rejected or accepted).",
						["accepted", "rejected"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					status: argv["status"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, {
						body: bodyData,
						invite_id: argv["invite-id"],
					})
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
