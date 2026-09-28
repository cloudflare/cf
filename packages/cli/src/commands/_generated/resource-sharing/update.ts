import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/resource-sharing.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 resource-sharing update <share-id>\n\nUpdates the share's display name and tags. This endpoint does **not** modify recipients or resources — those are managed via dedicated subresource endpoints: - **Recipients**: Use `POST /accounts/{account_id}/shares/{share_id}/recipients` to add a single recipient, `PUT /accounts/{account_id}/shares/{share_id}/recipients` to replace the full recipient list, or `DELETE /accounts/{account_id}/shares/{share_id}/recipients/{recipient_id}` to remove a recipient. - **Resources**: Use the share's resource subresource endpoints. Updating is not immediate; an updated share object with a new status will be returned."
		)
		.positional("share-id", {
			type: "string",
			description: "Share identifier tag.",
			demandOption: true,
		})
		.option("name", { type: "string", description: "The name of the share." })
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Request body for \`PUT /accounts/{account_id}/shares/{share_id}\`. The share's display \`name\` and \`tags\` can be updated via this endpoint. To modify recipients, use the \`/accounts/{account_id}/shares/{share_id}/recipients\` subresource endpoints (POST, PUT, DELETE). ",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"share-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <share-id>",
	describe: "Update a share",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "resource-sharing update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf resource-sharing update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/shares/${argv["share-id"] == null ? "<share-id>" : encodeURIComponent(String(argv["share-id"]))}`,
						pathParams: { "share-id": String(argv["share-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request>(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.resourceSharing.update({
							...bodyData,
							account_id: accountId,
							share_id: argv["share-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"The name of the share."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.resourceSharing.update({
						...bodyData,
						account_id: accountId,
						share_id: argv["share-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
