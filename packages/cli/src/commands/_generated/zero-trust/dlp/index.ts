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
import $validators from "./validators/index.js";
/**
 * dlp command group
 * @generated from apis/overlays/zero-trust.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "dlp",
	describe: "Operations for dlp",

	routes: {
		"custom-prompt-topics": $customprompttopics,
		"data-classes": $dataclasses,
		"data-tag-categories": $datatagcategories,
		"data-tag-category-templates": $datatagcategorytemplates,
		"data-tags": $datatags,
		datasets: $datasets,
		"document-fingerprints": $documentfingerprints,
		email: $email,
		entries: $entries,
		limits: $limits,
		patterns: $patterns,
		profiles: $profiles,
		"sensitivity-group-templates": $sensitivitygrouptemplates,
		"sensitivity-groups": $sensitivitygroups,
		"sensitivity-levels": $sensitivitylevels,
		settings: $settings,
		validators: $validators,
	},
});

export default command;
