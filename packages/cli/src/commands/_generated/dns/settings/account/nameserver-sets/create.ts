import operation from "../../../../_operations/dns/settings/account/nameserver-sets/create.js";
/**
 * create command
 * @generated from apis/overlays/dns.ts
 */
import type { ArgClassification } from "#lib/telemetry/index.js";
import { apiCommand } from "#lib/api-command.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

const command = apiCommand({
	command: "create",
	describe: "Create Custom Nameserver Set",
	usage:
		"$0 dns settings account nameserver-sets create\n\nCreates a named Custom Nameserver Set. Only the customer-defined name can be changed later. To change nameservers or addresses, create a new set, move any zone assignments, and delete the old set. For details, refer to [Nameserver sets](https://developers.cloudflare.com/dns/nameservers/custom-nameservers/nameserver-sets/).",
	flags: {
		advanced: {
			kind: "boolean",
			brief:
				"Whether to allocate the nameservers from distinct Advanced anycast groups.",
			default: false,
		},
		"ip-set": {
			kind: "parsed",
			brief:
				"Selects the account-specific IP set that supplies the nameserver addresses. Nameserver sets with the same `ip_set` and `advanced` value may reuse addresses; otherwise, they use disjoint address groups.",
			default: "1",
			parse: Number,
		},
		name: {
			kind: "parsed",
			brief:
				"Customer-defined name, unique within the account by exact string equality (case-sensitive, with no Unicode normalization). Must be valid UTF-8 and at most 255 UTF-8 bytes, not 255 characters. Only graphical Unicode characters are allowed; leading or trailing whitespace is rejected. The name can be changed without changing the set's nameservers or addresses.",
			optional: true,
			parse: String,
		},
		nameservers: {
			kind: "parsed",
			brief:
				'Lists each nameserver and the number of addresses to allocate to it. Requires a unique name for each entry in the set. Provide as a JSON array of objects or @path/to/file.json. Shape: [{"name": string, "ip_count"?: number}]. ? marks optional keys.',
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
			brief: "Raw JSON request body (bypasses individual flags)",
			optional: true,
			parse: String,
		},
	},
	operands: [],
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "dns settings account nameserver-sets create",
				classification: {
					safeFlags: ["advanced", "dry-run"],
				} satisfies ArgClassification<typeof argv>,
			},
			argv as Record<string, unknown>,
			async () => {
				const resolveRequiredFields = async (): Promise<void> => {
					if (argv["name"] === undefined) {
						argv["name"] = await promptForRequiredField(
							"name",
							"Customer-defined name, unique within the account by exact string equality (case-sensitive, with no Unicode normalization). Must be valid UTF-8 and at most 255 UTF-8 bytes, not 255 characters. Only graphical Unicode characters are allowed; leading or trailing whitespace is rejected. The name can be changed without changing the set's nameservers or addresses."
						);
					}
					if (argv["nameservers"] === undefined) {
						throw new Error(
							"--nameservers is required (or pass --body with this field set)."
						);
					}
				};
				if (argv.dryRun) {
					if (argv.body === undefined) {
						await resolveRequiredFields();
					}
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf dns settings account nameserver-sets create",
						method: "POST",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/dns_settings/nameserver_sets`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										advanced: argv["advanced"],
										ip_set: argv["ip-set"],
										name: resolveFileToken(
											argv["name"] as string | undefined,
											"name",
											"text"
										),
										nameservers: parseObjectArray(
											argv["nameservers"],
											"nameservers"
										),
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
					advanced: argv["advanced"],
					ip_set: argv["ip-set"],
					name: resolveFileToken(
						argv["name"] as string | undefined,
						"name",
						"text"
					),
					nameservers: parseObjectArray(argv["nameservers"], "nameservers"),
				});
				const result = await withProgress(`Creating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Created` });
			}
		),
});

export default command;
