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
 * create command
 * @generated from apis/overlays/dls.ts
 */
import type { Argv, CommandModule } from "yargs";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 dls regional_services prefix_bindings create\n\nCreate a DLS prefix binding"
		)
		.option("cidr", {
			type: "string",
			description: "IP prefix in CIDR notation to bind.",
		})
		.option("prefix-id", {
			type: "string",
			description: "The ID of the parent IP prefix that contains the CIDR.",
		})
		.option("region-key", {
			type: "string",
			description: 'Region key from managed regions (e.g., "us", "eu").',
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

type Request = SdkRequest<"publicCreatePrefixBinding">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create a DLS prefix binding",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dls regional_services prefix_bindings create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dls regional_services prefix_bindings create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dls/regional_services/prefix_bindings`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										cidr: resolveFileToken(
											argv["cidr"] as string | undefined,
											"cidr",
											"text"
										),
										prefix_id: resolveFileToken(
											argv["prefix-id"] as string | undefined,
											"prefix-id",
											"text"
										),
										region_key: resolveFileToken(
											argv["region-key"] as string | undefined,
											"region-key",
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
					const result = await withProgress(`Creating`, async () =>
						client.dls.regionalServices.prefixBindings.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["cidr"] === undefined) {
					argv["cidr"] = await promptForRequiredField(
						"cidr",
						"IP prefix in CIDR notation to bind."
					);
				}
				if (argv["prefix-id"] === undefined) {
					argv["prefix-id"] = await promptForRequiredField(
						"prefix-id",
						"The ID of the parent IP prefix that contains the CIDR."
					);
				}
				if (argv["region-key"] === undefined) {
					argv["region-key"] = await promptForRequiredField(
						"region-key",
						'Region key from managed regions (e.g., "us", "eu").'
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					cidr: resolveFileToken(
						argv["cidr"] as string | undefined,
						"cidr",
						"text"
					),
					prefix_id: resolveFileToken(
						argv["prefix-id"] as string | undefined,
						"prefix-id",
						"text"
					),
					region_key: resolveFileToken(
						argv["region-key"] as string | undefined,
						"region-key",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.dls.regionalServices.prefixBindings.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
