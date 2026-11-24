import $schemavalidation from "./schema-validation/index.js";
import $sessionidentifiers from "./session-identifiers/index.js";
import $tokenvalidation from "./token-validation/index.js";
import $vulnerabilityscanner from "./vulnerability-scanner/index.js";
/**
 * api-security command
 * @generated from apis/overlays/api-security.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "api-security",
	describe: "api-security",

	routes: {
		"schema-validation": $schemavalidation,
		"session-identifiers": $sessionidentifiers,
		"token-validation": $tokenvalidation,
		"vulnerability-scanner": $vulnerabilityscanner,
	},
});

export default command;
