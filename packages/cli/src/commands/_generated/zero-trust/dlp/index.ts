import $customprompttopics from "./custom-prompt-topics/index.js";
import $dataclasses from "./data-classes/index.js";
import $datatagcategories from "./data-tag-categories/index.js";
import $datatagcategorytemplates from "./data-tag-category-templates/index.js";
import $datatags from "./data-tags/index.js";
import $datasets from "./datasets/index.js";
import $documentfingerprints from "./document-fingerprints/index.js";
import $email from "./email/index.js";
import $entries from "./entries/index.js";
import $limits from "./limits/index.js";
import $patterns from "./patterns/index.js";
import $profiles from "./profiles/index.js";
import $sensitivitygrouptemplates from "./sensitivity-group-templates/index.js";
import $sensitivitygroups from "./sensitivity-groups/index.js";
import $sensitivitylevels from "./sensitivity-levels/index.js";
import $settings from "./settings/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * dlp command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "dlp",
	describe: "Operations for dlp",

	builder: (yargs) => {
		return yargs
			.command($customprompttopics)
			.command($dataclasses)
			.command($datatagcategories)
			.command($datatagcategorytemplates)
			.command($datatags)
			.command($datasets)
			.command($documentfingerprints)
			.command($email)
			.command($entries)
			.command($limits)
			.command($patterns)
			.command($profiles)
			.command($sensitivitygrouptemplates)
			.command($sensitivitygroups)
			.command($sensitivitylevels)
			.command($settings)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
