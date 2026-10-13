import operation from "../../_operations/reporting/industry/update.js";
import type { CommonYargsOptions, InferArgs } from "#lib/cli-types.js";
import type { ArgClassification } from "#lib/telemetry/index.js";
/**
 * update command
 * @generated from apis/overlays/reporting.ts
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
import { promptForRequiredEnumField } from "#lib/prompt.js";
import { runWithTelemetry } from "#lib/telemetry/index.js";

function builder(yargs: Argv<CommonYargsOptions>) {
	return yargs
		.usage(
			"$0 reporting industry update\n\nUpdates the industry classification for an account."
		)
		.option("industry", {
			type: "string",
			description: "The industry of the account",
			choices: [
				"accounting",
				"adult_entertainment",
				"agriculture",
				"airlines_aviation_aerospace",
				"animation_design",
				"apparel_fashion",
				"architecture_planning",
				"automotive",
				"banking_financial_services",
				"broadcast_media",
				"building_materials_construction",
				"business_services_supplies_equipment",
				"computer_hardware",
				"computer_software",
				"construction_civil_engineering",
				"consumer_electronics",
				"consumer_goods",
				"consumer_services",
				"cosmetics",
				"cryptocurrency",
				"cyber_security",
				"defense_space",
				"e_learning",
				"education_academia",
				"education_management",
				"entertainment",
				"environmental_services",
				"events_services",
				"facilities_services",
				"fine_art_luxury_goods_jewelry",
				"food_beverage",
				"furniture",
				"gambling_casinos",
				"gaming",
				"government",
				"health_wellness_fitness",
				"holding_companies_conglomerates",
				"human_resources_staffing_recruiting",
				"information_technology_services",
				"insurance",
				"international_public_affairs",
				"international_trade_development",
				"internet",
				"investment_management",
				"law_firms_legal_services",
				"leisure_travel_tourism",
				"logistics_supply_chain_import_export",
				"management_consulting",
				"manufacturing_machinery_technology_engineering",
				"maritime",
				"market_research",
				"marketing_advertising",
				"media_production_publishing",
				"medical_devices_healthcare_software_services",
				"medical_practices_clinics_hospitals_health_care",
				"military_law_enforcement",
				"mining_minerals_metals",
				"motion_pictures_and_film",
				"museums_libraries",
				"music_art",
				"newspapers",
				"nonprofit",
				"oil_energy_utilities_waste",
				"organizations_local_business",
				"outsourcing_offshoring",
				"pharmaceuticals_biotechnology_alternative_medicine",
				"photographic_optical_equipment",
				"political_organization",
				"print_digital_media",
				"professional_training_coaching",
				"real_estate",
				"religious_institutions",
				"renewables_environment",
				"research_think_tanks",
				"restaurants",
				"retail",
				"security_services_investigations",
				"social_impact_and_community_services",
				"sporting_goods",
				"supermarkets_groceries",
				"telecommunications_service_providers_and_carriers",
				"transportation_shipping_packaging_delivery",
				"travel_lodging_hospitality",
				"wholesale",
			],
		})
		.coerce("industry", (value) => resolveFileToken(value, "industry", "text"))
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

const command: CommandModule<CommonYargsOptions, Args> = {
	command: "update",
	describe: "Update an account industry",
	builder,
	handler: async (argv): Promise<void> =>
		runWithTelemetry(
			{
				command: "reporting industry update",
				classification: {
					safeFlags: ["industry", "dry-run"],
				} satisfies ArgClassification<Args>,
			},
			argv as Record<string, unknown>,
			async () => {
				if (argv.dryRun) {
					const __cfDryRunAccountId = await resolveAccountIdSilent();
					formatDryRun({
						command: "cf reporting industry update",
						method: "PATCH",
						url: `https://api.cloudflare.com/client/v4/accounts/${__cfDryRunAccountId ?? "<account-id>"}/reporting/industry`,
						pathParams: {},
						bodyKind: "json",
						body:
							argv.body !== undefined
								? parseBody(argv.body)
								: compactBody({
										industry: argv["industry"],
									}),
					});
					return;
				}
				const client = await createCommandClient(argv);
				const accountId = argv.local ? LOCAL_ACCOUNT_ID : await getAccountId();
				argv.accountId = accountId;

				if (argv.body) {
					const bodyData = parseBody(argv.body);
					const result = await withProgress(`Updating`, async () =>
						client.send(operation, { body: bodyData, account_id: accountId })
					);
					formatOutput(result, { successLabel: `Updated` });
					return;
				}
				if (argv["industry"] === undefined) {
					argv["industry"] = await promptForRequiredEnumField(
						"industry",
						"The industry of the account",
						[
							"accounting",
							"adult_entertainment",
							"agriculture",
							"airlines_aviation_aerospace",
							"animation_design",
							"apparel_fashion",
							"architecture_planning",
							"automotive",
							"banking_financial_services",
							"broadcast_media",
							"building_materials_construction",
							"business_services_supplies_equipment",
							"computer_hardware",
							"computer_software",
							"construction_civil_engineering",
							"consumer_electronics",
							"consumer_goods",
							"consumer_services",
							"cosmetics",
							"cryptocurrency",
							"cyber_security",
							"defense_space",
							"e_learning",
							"education_academia",
							"education_management",
							"entertainment",
							"environmental_services",
							"events_services",
							"facilities_services",
							"fine_art_luxury_goods_jewelry",
							"food_beverage",
							"furniture",
							"gambling_casinos",
							"gaming",
							"government",
							"health_wellness_fitness",
							"holding_companies_conglomerates",
							"human_resources_staffing_recruiting",
							"information_technology_services",
							"insurance",
							"international_public_affairs",
							"international_trade_development",
							"internet",
							"investment_management",
							"law_firms_legal_services",
							"leisure_travel_tourism",
							"logistics_supply_chain_import_export",
							"management_consulting",
							"manufacturing_machinery_technology_engineering",
							"maritime",
							"market_research",
							"marketing_advertising",
							"media_production_publishing",
							"medical_devices_healthcare_software_services",
							"medical_practices_clinics_hospitals_health_care",
							"military_law_enforcement",
							"mining_minerals_metals",
							"motion_pictures_and_film",
							"museums_libraries",
							"music_art",
							"newspapers",
							"nonprofit",
							"oil_energy_utilities_waste",
							"organizations_local_business",
							"outsourcing_offshoring",
							"pharmaceuticals_biotechnology_alternative_medicine",
							"photographic_optical_equipment",
							"political_organization",
							"print_digital_media",
							"professional_training_coaching",
							"real_estate",
							"religious_institutions",
							"renewables_environment",
							"research_think_tanks",
							"restaurants",
							"retail",
							"security_services_investigations",
							"social_impact_and_community_services",
							"sporting_goods",
							"supermarkets_groceries",
							"telecommunications_service_providers_and_carriers",
							"transportation_shipping_packaging_delivery",
							"travel_lodging_hospitality",
							"wholesale",
						] as const
					);
				}

				// Assemble request body from individual flags
				const bodyData = compactBody({
					industry: argv["industry"],
				});
				const result = await withProgress(`Updating`, async () =>
					client.send(operation, { body: bodyData, account_id: accountId })
				);
				formatOutput(result, { successLabel: `Updated` });
			}
		),
};

export default command;
