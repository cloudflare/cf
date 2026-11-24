import $addressmaps from "./address-maps/index.js";
import $leases from "./leases/index.js";
import $loadocuments from "./loa-documents/index.js";
import $prefixes from "./prefixes/index.js";
import $regionalhostnames from "./regional-hostnames/index.js";
import $services from "./services/index.js";
/**
 * addressing command
 * @generated from apis/overlays/addressing.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "addressing",
	describe: "addressing",

	routes: {
		"address-maps": $addressmaps,
		leases: $leases,
		"loa-documents": $loadocuments,
		prefixes: $prefixes,
		"regional-hostnames": $regionalhostnames,
		services: $services,
	},
});

export default command;
