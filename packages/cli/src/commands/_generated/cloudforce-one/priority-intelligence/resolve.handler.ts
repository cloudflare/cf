import operation from "../../_operations/cloudforce-one/priority-intelligence/resolve.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
import type { Args } from "./resolve.js";
import {
	createCommandClient,
	getAccountId,
	resolveAccountIdSilent,
} from "#lib/auth.js";
import { compactBody, parseBody, parseObjectArray } from "#lib/body-parser.js";
import { validateBodyUnions } from "#lib/body-unions.js";
import { formatDryRun } from "#lib/dry-run.js";
import { resolveFileToken } from "#lib/input-validation.js";
import { LOCAL_ACCOUNT_ID } from "#lib/local.js";
import { formatOutput } from "#lib/output.js";
import { withProgress } from "#lib/progress.js";
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";
const bodyUnions: Parameters<typeof validateBodyUnions>[1] = [
	{
		path: ["definition"],
		selector: "mode",
		variants: [
			{
				values: ["managed"],
				schema: {
					type: "object",
					properties: {
						additional_criteria: {
							type: "array",
							items: {
								type: "object",
								properties: {
									band: { enum: ["highly", "somewhat", "not"] },
									id: { type: "string" },
									text: { type: "string" },
								},
								required: ["band", "id", "text"],
								additionalProperties: false,
							},
							maxItems: 20,
						},
						criterion_selections: {
							type: "object",
							properties: {
								add: { type: "array", items: { type: "string" }, maxItems: 50 },
								remove: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
							},
							required: [],
							additionalProperties: false,
						},
						mode: { enum: ["managed"] },
						question: {
							anyOf: [
								{
									type: "object",
									properties: { mode: { enum: ["inherit"] } },
									required: ["mode"],
									additionalProperties: false,
								},
								{
									type: "object",
									properties: {
										mode: { enum: ["replace"] },
										value: { type: "string" },
									},
									required: ["mode", "value"],
									additionalProperties: false,
								},
							],
						},
						schema_version: { enum: [1] },
						selections: {
							type: "object",
							properties: {
								actor_notes: { type: "string" },
								actor_types: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"nation-state",
															"crime-syndicate",
															"criminal",
															"activist",
															"hacker",
															"insider-disgruntled",
															"insider-accidental",
															"spy",
															"terrorist",
															"competitor",
															"sensationalist",
														],
													},
													maxItems: 11,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								actors: {
									type: "object",
									properties: {
										add: {
											type: "array",
											items: { type: "string" },
											maxItems: 50,
										},
										remove: {
											type: "array",
											items: { type: "string" },
											maxItems: 50,
										},
									},
									required: [],
									additionalProperties: false,
								},
								attributed_countries: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								countries: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: { type: "string" },
													maxItems: 50,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								cves: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								excluded_actors: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								key_suppliers: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														type: "object",
														properties: {
															domains: {
																type: "array",
																items: { type: "string" },
																maxItems: 20,
															},
															name: { type: "string" },
														},
														required: ["name"],
														additionalProperties: false,
													},
													maxItems: 20,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								malware_tools: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								motivations: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"personal-gain",
															"organizational-gain",
															"ideology",
															"dominance",
															"notoriety",
															"coercion",
															"revenge",
														],
													},
													maxItems: 7,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								peers: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														type: "object",
														properties: {
															domains: {
																type: "array",
																items: { type: "string" },
																maxItems: 20,
															},
															name: { type: "string" },
														},
														required: ["name"],
														additionalProperties: false,
													},
													maxItems: 20,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								sectors: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"aerospace",
															"agriculture",
															"automotive",
															"chemical",
															"commercial",
															"communications",
															"construction",
															"defense",
															"education",
															"energy",
															"entertainment",
															"financial-services",
															"government-local",
															"government-national",
															"government-public-services",
															"government-regional",
															"healthcare",
															"hospitality-leisure",
															"infrastructure",
															"insurance",
															"manufacturing",
															"mining",
															"non-profit",
															"pharmaceuticals",
															"professional-services",
															"retail",
															"technology",
															"telecommunications",
															"transportation",
															"utilities",
														],
													},
													maxItems: 10,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								targets: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"organization",
															"customers",
															"employees",
															"executives",
															"partners",
															"events",
															"products-infrastructure",
														],
													},
													maxItems: 7,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								technique_ids: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								technologies: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: { type: "string" },
													maxItems: 50,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
							},
							required: [],
							additionalProperties: false,
						},
						title: {
							anyOf: [
								{
									type: "object",
									properties: { mode: { enum: ["inherit"] } },
									required: ["mode"],
									additionalProperties: false,
								},
								{
									type: "object",
									properties: {
										mode: { enum: ["replace"] },
										value: { type: "string" },
									},
									required: ["mode", "value"],
									additionalProperties: false,
								},
							],
						},
						topic_id: { type: "string" },
					},
					required: ["mode", "schema_version", "topic_id"],
					additionalProperties: false,
				},
			},
			{
				values: ["custom"],
				schema: {
					type: "object",
					properties: {
						mode: { enum: ["custom"] },
						question: { type: "string" },
						relevance_criteria: {
							type: "array",
							items: {
								type: "object",
								properties: {
									band: { enum: ["highly", "somewhat", "not"] },
									id: { type: "string" },
									text: { type: "string" },
								},
								required: ["band", "id", "text"],
								additionalProperties: false,
							},
							maxItems: 30,
						},
						schema_version: { enum: [1] },
						selections: {
							type: "object",
							properties: {
								actor_notes: { type: "string" },
								actor_types: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"nation-state",
															"crime-syndicate",
															"criminal",
															"activist",
															"hacker",
															"insider-disgruntled",
															"insider-accidental",
															"spy",
															"terrorist",
															"competitor",
															"sensationalist",
														],
													},
													maxItems: 11,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								actors: {
									type: "object",
									properties: {
										add: {
											type: "array",
											items: { type: "string" },
											maxItems: 50,
										},
										remove: {
											type: "array",
											items: { type: "string" },
											maxItems: 50,
										},
									},
									required: [],
									additionalProperties: false,
								},
								attributed_countries: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								countries: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: { type: "string" },
													maxItems: 50,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								cves: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								excluded_actors: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								key_suppliers: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														type: "object",
														properties: {
															domains: {
																type: "array",
																items: { type: "string" },
																maxItems: 20,
															},
															name: { type: "string" },
														},
														required: ["name"],
														additionalProperties: false,
													},
													maxItems: 20,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								malware_tools: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								motivations: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"personal-gain",
															"organizational-gain",
															"ideology",
															"dominance",
															"notoriety",
															"coercion",
															"revenge",
														],
													},
													maxItems: 7,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								peers: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														type: "object",
														properties: {
															domains: {
																type: "array",
																items: { type: "string" },
																maxItems: 20,
															},
															name: { type: "string" },
														},
														required: ["name"],
														additionalProperties: false,
													},
													maxItems: 20,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								sectors: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"aerospace",
															"agriculture",
															"automotive",
															"chemical",
															"commercial",
															"communications",
															"construction",
															"defense",
															"education",
															"energy",
															"entertainment",
															"financial-services",
															"government-local",
															"government-national",
															"government-public-services",
															"government-regional",
															"healthcare",
															"hospitality-leisure",
															"infrastructure",
															"insurance",
															"manufacturing",
															"mining",
															"non-profit",
															"pharmaceuticals",
															"professional-services",
															"retail",
															"technology",
															"telecommunications",
															"transportation",
															"utilities",
														],
													},
													maxItems: 10,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								targets: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: {
														enum: [
															"organization",
															"customers",
															"employees",
															"executives",
															"partners",
															"events",
															"products-infrastructure",
														],
													},
													maxItems: 7,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
								technique_ids: {
									type: "array",
									items: { type: "string" },
									maxItems: 50,
								},
								technologies: {
									anyOf: [
										{
											type: "object",
											properties: { mode: { enum: ["inherit"] } },
											required: ["mode"],
											additionalProperties: false,
										},
										{
											type: "object",
											properties: {
												mode: { enum: ["replace"] },
												value: {
													type: "array",
													items: { type: "string" },
													maxItems: 50,
												},
											},
											required: ["mode", "value"],
											additionalProperties: false,
										},
									],
								},
							},
							required: [],
							additionalProperties: false,
						},
						title: { type: "string" },
					},
					required: [
						"mode",
						"question",
						"relevance_criteria",
						"schema_version",
						"title",
					],
					additionalProperties: false,
				},
			},
		],
	},
];

export default async function handle(argv: Args): Promise<void> {
	return runWithTelemetry(
		{
			command: "cloudforce-one priority-intelligence resolve",
			classification: {
				safeFlags: [
					"definition-mode",
					"definition-question-mode",
					"definition-selections-actor-types-mode",
					"definition-selections-countries-mode",
					"definition-selections-key-suppliers-mode",
					"definition-selections-motivations-mode",
					"definition-selections-peers-mode",
					"definition-selections-sectors-mode",
					"definition-selections-targets-mode",
					"definition-selections-technologies-mode",
					"definition-title-mode",
					"dry-run",
				],
			} satisfies ArgClassification<typeof argv>,
		},
		argv as Record<string, unknown>,
		async () => {
			const resolveRequiredFields = async (): Promise<void> => {
				if (argv["definition-mode"] === undefined) {
					argv["definition-mode"] = await promptForRequiredEnumField(
						"definition-mode",
						"The definition.mode field",
						["managed", "custom"] as const
					);
				}
				if (argv["definition-schema-version"] === undefined) {
					throw new Error(
						"--definition-schema-version is required (or pass --body with this field set)."
					);
				}
			};
			if (argv.dryRun) {
				if (argv.body === undefined) {
					await resolveRequiredFields();
				}
				const __cfDryRunAccountId = await resolveAccountIdSilent();
				formatDryRun({
					command: "cf cloudforce-one priority-intelligence resolve",
					method: "POST",
					url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/cloudforce-one/v2/priority-intelligence/resolve`,
					pathParams: {},
					bodyKind: "json",
					body:
						argv.body !== undefined
							? parseBody(argv.body)
							: validateBodyUnions(
									compactBody({
										definition: {
											additional_criteria: parseObjectArray(
												argv["definition-additional-criteria"],
												"definition-additional-criteria"
											),
											criterion_selections: {
												add: argv["definition-criterion-selections-add"],
												remove: argv["definition-criterion-selections-remove"],
											},
											mode: argv["definition-mode"],
											question: {
												mode: argv["definition-question-mode"],
												value: resolveFileToken(
													argv["definition-question-value"] as
														| string
														| undefined,
													"definition-question-value",
													"text"
												),
											},
											schema_version: argv["definition-schema-version"],
											selections: {
												actor_notes: resolveFileToken(
													argv["definition-selections-actor-notes"] as
														| string
														| undefined,
													"definition-selections-actor-notes",
													"text"
												),
												actor_types: {
													mode: argv["definition-selections-actor-types-mode"],
													value:
														argv["definition-selections-actor-types-value"],
												},
												actors: {
													add: argv["definition-selections-actors-add"],
													remove: argv["definition-selections-actors-remove"],
												},
												attributed_countries:
													argv["definition-selections-attributed-countries"],
												countries: {
													mode: argv["definition-selections-countries-mode"],
													value: argv["definition-selections-countries-value"],
												},
												cves: argv["definition-selections-cves"],
												excluded_actors:
													argv["definition-selections-excluded-actors"],
												key_suppliers: {
													mode: argv[
														"definition-selections-key-suppliers-mode"
													],
													value: parseObjectArray(
														argv["definition-selections-key-suppliers-value"],
														"definition-selections-key-suppliers-value"
													),
												},
												malware_tools:
													argv["definition-selections-malware-tools"],
												motivations: {
													mode: argv["definition-selections-motivations-mode"],
													value:
														argv["definition-selections-motivations-value"],
												},
												peers: {
													mode: argv["definition-selections-peers-mode"],
													value: parseObjectArray(
														argv["definition-selections-peers-value"],
														"definition-selections-peers-value"
													),
												},
												sectors: {
													mode: argv["definition-selections-sectors-mode"],
													value: argv["definition-selections-sectors-value"],
												},
												targets: {
													mode: argv["definition-selections-targets-mode"],
													value: argv["definition-selections-targets-value"],
												},
												technique_ids:
													argv["definition-selections-technique-ids"],
												technologies: {
													mode: argv["definition-selections-technologies-mode"],
													value:
														argv["definition-selections-technologies-value"],
												},
											},
											title: {
												mode: argv["definition-title-mode"],
												value: resolveFileToken(
													argv["definition-title-value"] as string | undefined,
													"definition-title-value",
													"text"
												),
											},
											topic_id: resolveFileToken(
												argv["definition-topic-id"] as string | undefined,
												"definition-topic-id",
												"text"
											),
											relevance_criteria: parseObjectArray(
												argv["definition-relevance-criteria"],
												"definition-relevance-criteria"
											),
										},
									}),
									bodyUnions
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
			const bodyData = compactBody({
				definition: {
					additional_criteria: parseObjectArray(
						argv["definition-additional-criteria"],
						"definition-additional-criteria"
					),
					criterion_selections: {
						add: argv["definition-criterion-selections-add"],
						remove: argv["definition-criterion-selections-remove"],
					},
					mode: argv["definition-mode"],
					question: {
						mode: argv["definition-question-mode"],
						value: resolveFileToken(
							argv["definition-question-value"] as string | undefined,
							"definition-question-value",
							"text"
						),
					},
					schema_version: argv["definition-schema-version"],
					selections: {
						actor_notes: resolveFileToken(
							argv["definition-selections-actor-notes"] as string | undefined,
							"definition-selections-actor-notes",
							"text"
						),
						actor_types: {
							mode: argv["definition-selections-actor-types-mode"],
							value: argv["definition-selections-actor-types-value"],
						},
						actors: {
							add: argv["definition-selections-actors-add"],
							remove: argv["definition-selections-actors-remove"],
						},
						attributed_countries:
							argv["definition-selections-attributed-countries"],
						countries: {
							mode: argv["definition-selections-countries-mode"],
							value: argv["definition-selections-countries-value"],
						},
						cves: argv["definition-selections-cves"],
						excluded_actors: argv["definition-selections-excluded-actors"],
						key_suppliers: {
							mode: argv["definition-selections-key-suppliers-mode"],
							value: parseObjectArray(
								argv["definition-selections-key-suppliers-value"],
								"definition-selections-key-suppliers-value"
							),
						},
						malware_tools: argv["definition-selections-malware-tools"],
						motivations: {
							mode: argv["definition-selections-motivations-mode"],
							value: argv["definition-selections-motivations-value"],
						},
						peers: {
							mode: argv["definition-selections-peers-mode"],
							value: parseObjectArray(
								argv["definition-selections-peers-value"],
								"definition-selections-peers-value"
							),
						},
						sectors: {
							mode: argv["definition-selections-sectors-mode"],
							value: argv["definition-selections-sectors-value"],
						},
						targets: {
							mode: argv["definition-selections-targets-mode"],
							value: argv["definition-selections-targets-value"],
						},
						technique_ids: argv["definition-selections-technique-ids"],
						technologies: {
							mode: argv["definition-selections-technologies-mode"],
							value: argv["definition-selections-technologies-value"],
						},
					},
					title: {
						mode: argv["definition-title-mode"],
						value: resolveFileToken(
							argv["definition-title-value"] as string | undefined,
							"definition-title-value",
							"text"
						),
					},
					topic_id: resolveFileToken(
						argv["definition-topic-id"] as string | undefined,
						"definition-topic-id",
						"text"
					),
					relevance_criteria: parseObjectArray(
						argv["definition-relevance-criteria"],
						"definition-relevance-criteria"
					),
				},
			});
			validateBodyUnions(bodyData, bodyUnions);
			const result = await withProgress(`Creating`, async () =>
				client.send(operation, { body: bodyData, account_id: accountId })
			);
			formatOutput(result, { successLabel: `Created` });
		}
	);
}
