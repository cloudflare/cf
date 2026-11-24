import operation from "../../_operations/magic-transit/routes/create.js";
/**
 * create command
 * @generated from apis/overlays/magic-transit.ts
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
	describe: "Create a Route",
	usage:
		"$0 magic-transit routes create\n\nCreates a new Magic static route. Use `?validate_only=true` as an optional query parameter to run validation only without persisting changes.",
	flags: {
		description: {
			kind: "parsed",
			brief: "An optional human provided description of the static route.",
			optional: true,
			parse: String,
		},
		nexthop: {
			kind: "parsed",
			brief: "The next-hop IP Address for the static route.",
			optional: true,
			parse: String,
		},
		prefix: {
			kind: "parsed",
			brief: "IP Prefix in Classless Inter-Domain Routing format.",
			optional: true,
			parse: String,
		},
		priority: {
			kind: "parsed",
			brief: "Priority of the static route.",
			optional: true,
			parse: Number,
		},
		"scope-colo-names": {
			kind: "parsed",
			brief: "List of colo names for the ECMP scope.",
			variadic: true,
			optional: true,
			parse: String,
		},
		"scope-colo-regions": {
			kind: "parsed",
			brief: "List of colo regions for the ECMP scope.",
			variadic: true,
			optional: true,
			parse: String,
		},
		weight: {
			kind: "parsed",
			brief: "Optional weight of the ECMP scope - if provided.",
			optional: true,
			parse: Number,
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "magic-transit routes create",
				classification: { safeFlags: ["dry-run"] } satisfies ArgClassification<
					typeof argv
				>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["nexthop"] === undefined) {
						argv["nexthop"] = await promptForRequiredField(
							"nexthop",
							"The next-hop IP Address for the static route."
						);
					}
					if (argv["prefix"] === undefined) {
						argv["prefix"] = await promptForRequiredField(
							"prefix",
							"IP Prefix in Classless Inter-Domain Routing format."
						);
					}
					if (argv["priority"] === undefined) {
						throw new Error(
							"--priority is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf magic-transit routes create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/magic/routes`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										nexthop: resolveFileToken(
											argv["nexthop"] as string | undefined,
											"nexthop",
											"text"
										),
										prefix: resolveFileToken(
											argv["prefix"] as string | undefined,
											"prefix",
											"text"
										),
										priority: argv["priority"],
										scope: {
											colo_names: argv["scope-colo-names"],
											colo_regions: argv["scope-colo-regions"],
										},
										weight: argv["weight"],
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
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					nexthop: resolveFileToken(
						argv["nexthop"] as string | undefined,
						"nexthop",
						"text"
					),
					prefix: resolveFileToken(
						argv["prefix"] as string | undefined,
						"prefix",
						"text"
					),
					priority: argv["priority"],
					scope: {
						colo_names: argv["scope-colo-names"],
						colo_regions: argv["scope-colo-regions"],
					},
					weight: argv["weight"],
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
