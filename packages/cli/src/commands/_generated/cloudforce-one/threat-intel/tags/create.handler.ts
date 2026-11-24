import operation from "../../../_operations/cloudforce-one/threat-intel/tags/create.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./create.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import {
	compactBody,
	parseBody,
	parseJsonMap,
	parseObjectArray,
} from "#lib/body-parser.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one threat-intel tags create",
			classification: {
				safeFlags: ["tlp", "dry-run"],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["value"] === undefined) {
					argv["value"] = await promptForRequiredField(
						"value",
						"The value field"
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one threat-intel tags create",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/events/tags/create`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: compactBody(
									{
										aliasGroupNames: argv["alias-group-names"],
										aliasGroupNamesInternal: argv["alias-group-names-internal"],
										aliases: parseObjectArray(argv["aliases"], "aliases"),
										categoryUuid: resolveFileToken(
											argv["category-uuid"] as string | undefined,
											"category-uuid",
											"text"
										),
										confidence: argv["confidence"],
										dateOfDiscovery: resolveFileToken(
											argv["date-of-discovery"] as string | undefined,
											"date-of-discovery",
											"text"
										),
										description: resolveFileToken(
											argv["description"] as string | undefined,
											"description",
											"text"
										),
										externalReferenceLinks: argv["external-reference-links"],
										externalReferences: parseObjectArray(
											argv["external-references"],
											"external-references"
										),
										internalAliases: parseObjectArray(
											argv["internal-aliases"],
											"internal-aliases"
										),
										internalDescription: resolveFileToken(
											argv["internal-description"] as string | undefined,
											"internal-description",
											"text"
										),
										lastSeen: resolveFileToken(
											argv["last-seen"] as string | undefined,
											"last-seen",
											"text"
										),
										properties: parseJsonMap(argv["properties"], "properties"),
										tlp: argv["tlp"],
										value: resolveFileToken(
											argv["value"] as string | undefined,
											"value",
											"text"
										),
									},
									[["properties"]]
								),
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
			const bodyData = compactBody(
				{
					aliasGroupNames: argv["alias-group-names"],
					aliasGroupNamesInternal: argv["alias-group-names-internal"],
					aliases: parseObjectArray(argv["aliases"], "aliases"),
					categoryUuid: resolveFileToken(
						argv["category-uuid"] as string | undefined,
						"category-uuid",
						"text"
					),
					confidence: argv["confidence"],
					dateOfDiscovery: resolveFileToken(
						argv["date-of-discovery"] as string | undefined,
						"date-of-discovery",
						"text"
					),
					description: resolveFileToken(
						argv["description"] as string | undefined,
						"description",
						"text"
					),
					externalReferenceLinks: argv["external-reference-links"],
					externalReferences: parseObjectArray(
						argv["external-references"],
						"external-references"
					),
					internalAliases: parseObjectArray(
						argv["internal-aliases"],
						"internal-aliases"
					),
					internalDescription: resolveFileToken(
						argv["internal-description"] as string | undefined,
						"internal-description",
						"text"
					),
					lastSeen: resolveFileToken(
						argv["last-seen"] as string | undefined,
						"last-seen",
						"text"
					),
					properties: parseJsonMap(argv["properties"], "properties"),
					tlp: argv["tlp"],
					value: resolveFileToken(
						argv["value"] as string | undefined,
						"value",
						"text"
					),
				},
				[["properties"]]
			);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
