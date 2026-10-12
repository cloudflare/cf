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
			"$0 zero-trust cws rego-modules update <rego-module-id>\n\nReplaces the module and validates policies and libraries that depend on it."
		)
		.positional("rego-module-id", {
			type: "string",
			description: "ID of the Rego module to update",
			demandOption: true,
		})
		.option("name", {
			type: "string",
			description: "Name of the Rego module (unique per account)",
		})
		.option("rego-source", {
			type: "string",
			description:
				'Library Rego source with a package beginning with "lib." Maximum 16384 UTF-8 bytes.',
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

type Request = SdkRequest<"cws-update-rego-module">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update <rego-module-id>",
	describe: "Update a Rego module",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "zero-trust cws rego-modules update",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf zero-trust cws rego-modules update",
						method: "PUT",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cws/rego-modules/${argv["rego-module-id"] == null ? "<rego-module-id>" : encodeURIComponent(String(argv["rego-module-id"]))}`,
						pathParams: {
							"rego-module-id": String(argv["rego-module-id"] ?? ""),
						},
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
										rego_source: resolveFileToken(
											argv["rego-source"] as string | undefined,
											"rego-source",
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
						client.zeroTrust.cws.regoModules.update({
							...bodyData,
							account_id: accountId,
							rego_module_id: argv["rego-module-id"],
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Name of the Rego module (unique per account)"
					);
				}
				if (argv["rego-source"] === undefined) {
					argv["rego-source"] = await promptForRequiredField(
						"rego-source",
						'Library Rego source with a package beginning with "lib." Maximum 16384 UTF-8 bytes.'
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					rego_source: resolveFileToken(
						argv["rego-source"] as string | undefined,
						"rego-source",
						"text"
					),
				});
				const result = await withProgress(`Updating`, async () =>
					client.zeroTrust.cws.regoModules.update({
						...bodyData,
						account_id: accountId,
						rego_module_id: argv["rego-module-id"],
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
