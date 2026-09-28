import $applications from "./applications/index.js";
import $authenticatordeviceaaguids from "./authenticator-device-aaguids/index.js";
import $bookmarks from "./bookmarks/index.js";
import $certificates from "./certificates/index.js";
import $custompages from "./custom-pages/index.js";
import $gatewayca from "./gateway-ca/index.js";
import $groups from "./groups/index.js";
import $idpfederationgrants from "./idp-federation-grants/index.js";
import $keys from "./keys/index.js";
import $logs from "./logs/index.js";
import $policies from "./policies/index.js";
import $samlcertificates from "./saml-certificates/index.js";
import $servicetokens from "./service-tokens/index.js";
import $tags from "./tags/index.js";
import $targets from "./targets/index.js";
import $users from "./users/index.js";
import type { CommonYargsOptions } from "#lib/cli-types.js";
/**
 * access command group
 * @generated from apis/overlays/zero-trust.ts
 */
import type { CommandModule } from "yargs";

const command: CommandModule<CommonYargsOptions> = {
	command: "access",
	describe: "Operations for access",

	builder: (yargs) => {
		return yargs
			.command($applications)
			.command($authenticatordeviceaaguids)
			.command($bookmarks)
			.command($certificates)
			.command($custompages)
			.command($gatewayca)
			.command($groups)
			.command($idpfederationgrants)
			.command($keys)
			.command($logs)
			.command($policies)
			.command($samlcertificates)
			.command($servicetokens)
			.command($tags)
			.command($targets)
			.command($users)
			.demandCommand(1, "Please specify a subcommand");
	},

	handler: () => {},
};

export default command;
