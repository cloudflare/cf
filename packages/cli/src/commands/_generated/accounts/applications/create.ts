import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { SdkRequest } from "#sdk";
/**
 * create command
 * @generated from apis/overlays/accounts.ts
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
			"$0 accounts applications create\n\nCreate a custom application for an account."
		)
		.option("category-id", {
			type: "number",
			description: "Returns the category ID.",
		})
		.option("hostnames", {
			type: "string",
			array: true,
			description: "Hostnames matched by the application.",
		})
		.option("human-id", {
			type: "string",
			description: "Returns the human readable ID.",
		})
		.option("ip-subnets", {
			type: "string",
			array: true,
			description:
				"IP subnets for this application. Custom application create and update requests accept IPv4 prefix lengths /8 through /32 and IPv6 prefix lengths /32 through /128.",
		})
		.option("name", {
			type: "string",
			description: "Returns the application name.",
		})
		.option("port-protocols", {
			type: "string",
			array: true,
			description: "Port and protocol pairs matched by the application.",
		})
		.option("support-domains", {
			type: "string",
			array: true,
			description: "Support domains matched by the application.",
		})
		.option("dry-run", {
			type: "boolean",
			description: "Validate and show what would happen without executing",
			default: false,
		})
		.option("body", {
			type: "string",
			description:
				"Defines a custom application. At least one hostname or IP subnet is required. Support domains and port/protocol pairs do not satisfy this requirement. ",
		});
}

type Args = InferArgs<typeof builder>;

type Request = SdkRequest<"createResourceLibraryApplication">;
type Body = Request["body"];

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "create",
	describe: "Create application",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts applications create",
				classification: {
					safeFlags: ["dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf accounts applications create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/resource-library/applications`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										category_id: argv["category-id"],
										hostnames: argv["hostnames"],
										human_id: resolveFileToken(
											argv["human-id"] as string | undefined,
											"human-id",
											"text"
										),
										ip_subnets: argv["ip-subnets"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										port_protocols: argv["port-protocols"],
										support_domains: argv["support-domains"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody<Request["body"]>(argv.body);
					const result = await withProgress(`Creating`, async () =>
						client.accounts.applications.create({
							body: bodyData,
							account_id: accountId,
						} satisfies Request)
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				if (argv["category-id"] === undefined) {
					throw new Error(
						"--category-id is required (or pass --body with this field set)."
					);
				}
				if (argv["human-id"] === undefined) {
					argv["human-id"] = await promptForRequiredField(
						"human-id",
						"Returns the human readable ID."
					);
				}
				if (argv["name"] === undefined) {
					argv["name"] = await promptForRequiredField(
						"name",
						"Returns the application name."
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody<Body>({
					category_id: argv["category-id"],
					hostnames: argv["hostnames"],
					human_id: resolveFileToken(
						argv["human-id"] as string | undefined,
						"human-id",
						"text"
					),
					ip_subnets: argv["ip-subnets"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					port_protocols: argv["port-protocols"],
					support_domains: argv["support-domains"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.accounts.applications.create({
						body: bodyData,
						account_id: accountId,
					} satisfies Request)
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
};

export default command;
