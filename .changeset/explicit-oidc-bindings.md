---
"cf": minor
---

Support experimental Workers OIDC identity bindings through the shared SDK configuration and upload path.

Use `bindings.oidc({ identity_id, audience, allowed_audiences })` from `cf/config`, then call `env.IDENTITY.getToken({ audience, fresh })`. Configuration requests an existing approved assignment. Deploying or copying it cannot grant access to an identity. `cf dev` forwards the selected authentication profile to the shared Wrangler or Vite broker.

For local issuance, use the matching Wrangler or Vite development server and workerd build. `cf dev` continues to run the development server installed in your project.
