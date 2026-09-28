import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/organization.ts
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
		.usage(
			"$0 organization invite update <member-code>\n\nAccept or reject an invitation to a specific organization. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.positional("member-code", {
			type: "string",
			description: "The invitation code to accept or reject.",
			demandOption: true,
		})
		.option("organization-id", {
			type: "string",
			description: "The ID of the organization associated with the invitation.",
			demandOption: true,
		})
		.option("status", {
			type: "string",
			description: "The status field",
			choices: ["accept", "reject"],
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"The invitation action. Use \`accept\` to join the organization or \`reject\` to decline the invitation.",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"Organizations_handleOrganizationInvite">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <member-code>",
	describe: "Handle organization invite",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization invite update",
				classification: {
					safeFlags: ["status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization invite update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/invites/${argv["member-code"] == null ? "<member-code>" : encodeURIComponent(String(argv["member-code"]))}`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
							"member-code": String(argv["member-code"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										status: resolveFileToken(
											argv["status"] as string | undefined,
											"status",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.organization.invite.update({
							...bodyData,
							organization_id: argv["organization-id"],
							member_code: argv["member-code"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["status"] === undefined) {
					argv["status"] = await promptForRequiredEnumField(
						"status",
						"The status field",
						["accept", "reject"] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					status: resolveFileToken(
						argv["status"] as string | undefined,
						"status",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.organization.invite.update({
						...bodyData,
						organization_id: argv["organization-id"],
						member_code: argv["member-code"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
