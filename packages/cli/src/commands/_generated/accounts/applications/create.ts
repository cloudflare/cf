import operation from "../../_operations/accounts/applications/create.js";
/**
 * create command
 * @generated from apis/overlays/accounts.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
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

const command = apiCommand({
	command: "create",
	describe: "Create application",
	usage:
		"$0 accounts applications create\n\nCreate a custom application for an account from a name, category, and optional network matchers.",
	flags: {
		"category-id": {
			kind: "parsed",
			brief: "Numeric identifier for an application category.",
			optional: true,
			parse: Number,
		},
		hostnames: {
			kind: "parsed",
			brief: "Hostnames matched by the application.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"human-id": {
			kind: "parsed",
			brief: "Human-readable identifier for the application.",
			optional: true,
			parse: String,
		},
		"ip-subnets": {
			kind: "parsed",
			brief:
				"IP subnets for this application. Custom application create and update requests accept IPv4 prefix lengths /8 through /32 and IPv6 prefix lengths /32 through /128.",
			variadic: true,
			optional: true,
			parse: String,
		},
		name: {
			kind: "parsed",
			brief: "Application name.",
			optional: true,
			parse: String,
		},
		"port-protocols": {
			kind: "parsed",
			brief:
				"Ports matched by the application, in `protocol/port` or inclusive `protocol/start-end` format (for example, `tcp/443` or `udp/10000-20000`). TCP and UDP ports must be between 0 and 65535.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"support-domains": {
			kind: "parsed",
			brief: "Support domains matched by the application.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Defines a custom application. At least one hostname or IP subnet is required. Support domains and port/protocol pairs do not satisfy this requirement. A NUL character (U+0000) in any string value returns `400`. ",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "accounts applications create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["category-id"] === undefined) {
						throw new Error(
							"--category-id is required (or pass --body with this field set)."
						);
					}
					if (argv["human-id"] === undefined) {
						argv["human-id"] = await promptForRequiredField(
							"human-id",
							"Human-readable identifier for the application."
						);
					}
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Application name."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
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
				const parsedBody =
					argv.body !== undefined ? parseBody(argv.body) : undefined;
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body !== undefined) {
					const bodyData = parsedBody;
					const result = await withProgress(`Creating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Created` });
					return;
				}
				await resolveRequiredFields();

				// Assemble request body from individual flags
				const bodyData = compactBody({
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
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
