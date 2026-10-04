import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/resource-sharing.ts
 */
import type { Argv, CommandModule } from "yargs";
import { createCommandClient } from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 resource-sharing recipients create <share-id>\n\nAdds a single recipient to an account-targeted resource share, granting them access to the shared resources. The recipient account must belong to the same organization as the share owner. To replace the entire recipient list in one call, use `PUT /accounts/{account_id}/shares/{share_id}/recipients` instead."
		)
		.positional("share-id", {
			type: "string",
			description: "Share identifier tag.",
			demandOption: true,
		})
		.option("account-id-path", {
			type: "string",
			description: "Account identifier.",
			demandOption: true,
		})
		.option("organization-id", {
			type: "string",
			description: "Organization identifier.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Optionally specify \`recipient_account_id\` to target a specific account, or \`organization_id\` to target the caller's whole organization. If neither is provided, the caller's organization is used. The legacy field \`account_id\` is accepted as a synonym for \`recipient_account_id\` during the deprecation period (see \`x-sunset\` on that field). ",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"share-recipient-create">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create <share-id>",
	describe: "Trigger a recipient addition to a share",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing recipients create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					formatDryRun({
						command: "cf resource-sharing recipients create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${argv["account-id-path"] == null ? "<account-id-path>" : encodeURIComponent(String(argv["account-id-path"]))}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}/recipients`,
						pathParams: {
							"account-id-path": String(argv["account-id-path"] ?? ""),
							"share-id": String(argv["share-id"] ?? ""),
						},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										organization_id: resolveFileToken(
											argv["organization-id"] as string | undefined,
											"organization-id",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.resourceSharing.recipients.create({
							body: bodyData,
							account_id_path: argv["account-id-path"],
							share_id: argv["share-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					organization_id: resolveFileToken(
						argv["organization-id"] as string | undefined,
						"organization-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.resourceSharing.recipients.create({
						body: bodyData,
						account_id_path: argv["account-id-path"],
						share_id: argv["share-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
