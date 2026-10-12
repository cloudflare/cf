import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * update command
 * @generated from apis/overlays/zero-trust.ts
 */
import type { Argv, CommandModule } from "yargs";
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

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 zero-trust gateway pacfiles update <pacfile-id>\n\nUpdate a configured Zero Trust Gateway PAC file."
		)
		.positional("pacfile-id", {
			type: "string",
			description: "Pacfile ID",
			demandOption: true,
		})
		.option("contents", {
			type: "string",
			description: "Actual contents of the PAC file",
		})
		.option("description", {
			type: "string",
			description: "Detailed description of the PAC file.",
		})
		.option("name", { type: "string", description: "Name of the PAC file." })
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

type Request = SdkRequest<"zero-trust-gateway-pacfiles-update">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <pacfile-id>",
	describe: "Update a Zero Trust Gateway PAC file",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust gateway pacfiles update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust gateway pacfiles update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/gateway/pacfiles/${argv["pacfile-id"] == null ? "<pacfile-id>" : encodeURIComponent(String(argv["pacfile-id"]))}`,
						pathParams: { "pacfile-id": String(argv["pacfile-id"] ?? "") },
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										contents: resolveFileToken(
											argv["contents"] as string | undefined,
											"contents",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
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
						client.zeroTrust.gateway.pacfiles.update({
							...bodyData,
							account_id: accountId,
							pacfile_id: argv["pacfile-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["contents"] === undefined) {
					argv["contents"] = await promptForRequiredField(
						"contents",
						"Actual contents of the PAC file"
					);
				}
				if (argv["description"] === undefined) {
					argv["description"] = await promptForRequiredField(
						"description",
						"Detailed description of the PAC file."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the PAC file."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					contents: resolveFileToken(
						argv["contents"] as string | undefined,
						"contents",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.gateway.pacfiles.update({
						...bodyData,
						account_id: accountId,
						pacfile_id: argv["pacfile-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
