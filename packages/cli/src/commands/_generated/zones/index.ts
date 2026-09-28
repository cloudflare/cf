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
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * zones command
 * @generated from apis/overlays/zones.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "zones",
	describe:
		"Zones are domains on Cloudflare — list, create, and configure domain settings",

	builder: (yargs) => {
		return yargs
			.command($create)
			.command($delete)
			.command($edit)
			.command($get)
			.command($list)
			.command($aegis)
			.command($automaticplatformoptimization)
			.command($binaryast)
			.command($fonts)
			.command($h2prioritization)
			.command($holds)
			.command($imageresizing)
			.command($originh2maxstreams)
			.command($originmaxhttpversion)
			.command($origintlscompliancemodes)
			.command($plans)
			.command($rateplans)
			.command($rum)
			.command($settings)
			.command($speedbrain)
			.command($subscriptions)
			.command($transformationsallowedorigins)
			.command($transformationsc2pa)
			.command($transformationsconfig)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
