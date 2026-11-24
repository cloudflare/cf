/**
 * create command
 * @generated from apis/overlays/containers.ts
 */
import {
	apiCommand,
	type ApiInputs,
	type ApiParameters,
} from "#lib/api-command.js";
import { resolveFileToken } from "#lib/input-validation.js";

const parameters = {
	flags: {
		"auth-private-credential-secret-name": {
			kind: "parsed",
			brief: "Name of the secret within the store.",
			optional: true,
			parse: String,
		},
		"auth-private-credential-store-id": {
			kind: "parsed",
			brief: "Identifier of the Secrets Store containing the secret.",
			optional: true,
			parse: String,
		},
		"auth-public-credential": {
			kind: "parsed",
			brief:
				"The non-secret part of the registry credential: an AWS access key ID for ECR,\na username for Docker Hub, or a service account email for Google Artifact Registry.\n",
			optional: true,
			parse: String,
		},
		domain: {
			kind: "parsed",
			brief:
				"Hostname of the private registry, without a scheme or image path. Supported\nhostnames are `docker.io`, AWS ECR hostnames, and Google Artifact Registry\n`*-docker.pkg.dev` hostnames.\n",
			optional: true,
			parse: String,
		},
		"is-public": {
			kind: "boolean",
			brief:
				"Omit this field or set it to `false`. Public Docker Hub images do not require\nregistry configuration and cannot be added with this endpoint.\n",
			optional: true,
		},
		kind: {
			kind: "parsed",
			brief:
				"Registry provider. This must match `domain`: `DockerHub` for `docker.io`,\n`ECR` for AWS ECR, or `GAR` for Google Artifact Registry.\n",
			optional: true,
			choices: ["ECR", "DockerHub", "GAR"],
			parse: String,
			coerce: (value: string) => resolveFileToken(value, "kind", "text"),
		},
		"dry-run": {
			kind: "boolean",
			brief: "Validate and show what would happen without executing",
			default: false,
		},
		body: {
			kind: "parsed",
			brief:
				"Configuration for connecting Containers to a supported private external image registry. See [Image management](https://developers.cloudflare.com/containers/platform-details/image-management/) for supported providers and credential setup instructions. ",
			optional: true,
			parse: String,
		},
	},
	operands: [],
} as const satisfies ApiParameters;
export type Args = ApiInputs<typeof parameters>;
const command = apiCommand({
	command: "create",
	describe: "Configure a private external image registry",
	usage:
		"$0 containers registries create\n\nRegisters credentials for a supported private external image registry so Containers can pull images from it. This endpoint does not create a registry or upload an image. Public Docker Hub images and images in the Cloudflare managed registry do not require this configuration. Refer to [Image management](https://developers.cloudflare.com/containers/platform-details/image-management/) for supported registries and instructions for storing registry credentials.",
	...parameters,
	loader: () => import("./create.handler.js"),
});

export default command;
