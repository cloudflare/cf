import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/addressing.ts
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
			"$0 addressing prefixes create\n\nAdd a new prefix under the account."
		)
		.option("asn", {
			type: "number",
			description:
				"Autonomous System Number (ASN) the prefix will be advertised under.",
		})
		.option("cidr", {
			type: "string",
			description: "IP Prefix in Classless Inter-Domain Routing format.",
		})
		.option("delegate-loa-creation", {
			type: "boolean",
			description:
				"Whether Cloudflare is allowed to generate the LOA document on behalf of the prefix owner.",
			default: false,
		})
		.option("description", {
			type: "string",
			description: "Description of the prefix.",
		})
		.option("loa-document-id", {
			type: "string",
			description: "Identifier for the uploaded LOA document.",
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

type Request = SdkRequest<"ip-address-management-prefixes-add-prefix">;
type Body = Request;

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Add Prefix",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "addressing prefixes create",
				classification: {
					safeFlags: ["delegate-loa-creation", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf addressing prefixes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/addressing/prefixes`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										asn: argv["asn"],
										cidr: resolveFileToken(
											argv["cidr"] as string | undefined,
											"cidr",
											"text"
										),
										delegate_loa_creation: argv["delegate-loa-creation"],
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										loa_document_id: resolveFileToken(
											argv["loa-document-id"] as string | undefined,
											"loa-document-id",
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
						client.addressing.prefixes.create({
							...bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["asn"] === undefined) {
					throw new Error(
						"--asn is required (or pass --body with this field set)."
					);
				}
				if (argv["cidr"] === undefined) {
					argv["cidr"] = await promptForRequiredField(
						"cidr",
						"IP Prefix in Classless Inter-Domain Routing format."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					asn: argv["asn"],
					cidr: resolveFileToken(
						argv["cidr"] as string | undefined,
						"cidr",
						"text"
					),
					delegate_loa_creation: argv["delegate-loa-creation"],
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					loa_document_id: resolveFileToken(
						argv["loa-document-id"] as string | undefined,
						"loa-document-id",
						"text"
					),
				});
				const result = await withProgress(`Creating`, async () =>
					client.addressing.prefixes.create({
						...bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
