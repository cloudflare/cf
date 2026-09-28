import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/organization.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 organization member create <organization-id>\n\nCreate a membership that grants access to a specific Organization. (Currently in Public Beta - see https://developers.cloudflare.com/fundamentals/organizations/)"
		)
		.positional("organization-id", {
			type: "string",
			description: "Organization ID",
			demandOption: true,
		})
		.option("member-status", {
			type: "string",
			description: "The member.status field",
			choices: ["active", "canceled"],
		})
		.option("member-user-email", {
			type: "string",
			description: "The member.user.email field",
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

type Request = SdkRequest<"Members_create">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <organization-id>",
	describe: "Create organization member",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "organization member create",
				classification: {
					safeFlags: ["member-status", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf organization member create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/organizations/${argv["organization-id"] == null ? "<organization-id>" : encodeURIComponent(String(argv["organization-id"]))}/members`,
						pathParams: {
							"organization-id": String(argv["organization-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										member: {
											status: resolveFileToken(
												argv["member-status"] as string | undefined,
												"member-status",
												"text"
											),
											user: {
												email: resolveFileToken(
													argv["member-user-email"] as string | undefined,
													"member-user-email",
													"text"
												),
											},
										},
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.organization.member.create({
							...bodyData,
							organization_id: argv["organization-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["member-user-email"] === undefined) {
					argv["member-user-email"] = await promptForRequiredField(
						"member-user-email",
						"The member.user.email field"
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					member: {
						status: resolveFileToken(
							argv["member-status"] as string | undefined,
							"member-status",
							"text"
						),
						user: {
							email: resolveFileToken(
								argv["member-user-email"] as string | undefined,
								"member-user-email",
								"text"
							),
						},
					},
				});
				const result = await withProgress(`Creating`, async () =>
					client.organization.member.create({
						...bodyData,
						organization_id: argv["organization-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
