import $namespaces from "./namespaces/index.js";
/**
 * durable-objects command
 * @generated from apis/overlays/durable-objects.ts
 */
import { apiGroup } from "#lib/api-command.js";

const command = apiGroup({
	command: "durable-objects",
	describe:
		"Stateful serverless objects with transactional storage, ideal for coordination, sessions, and real-time collaboration",

	routes: {
		namespaces: $namespaces,
	},
});

export default command;
