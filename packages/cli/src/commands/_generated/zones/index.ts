import $activationcheck from "./activation-check/index.js";
import $aegis from "./aegis/index.js";
import $automaticplatformoptimization from "./automatic-platform-optimization/index.js";
import $binaryast from "./binary-ast/index.js";
import $create from "./create.js";
import $delete from "./delete.js";
import $edit from "./edit.js";
import $fonts from "./fonts/index.js";
import $get from "./get.js";
import $h2prioritization from "./h2-prioritization/index.js";
import $holds from "./holds/index.js";
import $hostnames from "./hostnames/index.js";
import $imageresizing from "./image-resizing/index.js";
import $list from "./list.js";
import $originh2maxstreams from "./origin-h2-max-streams/index.js";
import $originmaxhttpversion from "./origin-max-http-version/index.js";
import $origintlscompliancemodes from "./origin-tls-compliance-modes/index.js";
import $plans from "./plans/index.js";
import $rateplans from "./rate-plans/index.js";
import $rum from "./rum/index.js";
import $settings from "./settings/index.js";
import $speedbrain from "./speed-brain/index.js";
import $subscriptions from "./subscriptions/index.js";
import $transformationsallowedorigins from "./transformations-allowed-origins/index.js";
import $transformationsc2pa from "./transformations-c2pa/index.js";
import $transformationsconfig from "./transformations-config/index.js";
/**
 * zones command
 * @generated from apis/overlays/zones.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "zones",
	describe:
		"Zones are domains on Cloudflare — list, create, and configure domain settings",

	routes: {
		create: $create,
		delete: $delete,
		edit: $edit,
		get: $get,
		list: $list,
		"activation-check": $activationcheck,
		aegis: $aegis,
		"automatic-platform-optimization": $automaticplatformoptimization,
		"binary-ast": $binaryast,
		fonts: $fonts,
		"h2-prioritization": $h2prioritization,
		holds: $holds,
		hostnames: $hostnames,
		"image-resizing": $imageresizing,
		"origin-h2-max-streams": $originh2maxstreams,
		"origin-max-http-version": $originmaxhttpversion,
		"origin-tls-compliance-modes": $origintlscompliancemodes,
		plans: $plans,
		"rate-plans": $rateplans,
		rum: $rum,
		settings: $settings,
		"speed-brain": $speedbrain,
		subscriptions: $subscriptions,
		"transformations-allowed-origins": $transformationsallowedorigins,
		"transformations-c2pa": $transformationsc2pa,
		"transformations-config": $transformationsconfig,
	},
});

export default command;
