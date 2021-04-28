<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  import type { Context } from "../hooks";

  export const load: Load = ({ page, session: _session }) => {
    // TODO: type Load properly when possible
    // https://github.com/sveltejs/kit/issues/647
    const session = _session as Context;

    if (session.user) {
      return {
        props: { user: session.user, logoutUrl: `${session.authUrl}/logout` },
      };
    } else if (session.user === null) {
      return {
        status: 403,
        error: new Error(`Could not authenticate: ${session.jwtError}`),
      };
    } else {
      const qs = page.query.toString();
      const returnPath = page.path + (qs.length > 0 ? `?${qs}` : "");
      const returnUrl = `${session.host}${returnPath}`;
      return {
        status: 307,
        redirect: `${session.authUrl}/azuread/login?redirectUrl=${returnUrl}`,
      };
    }
  };
</script>

<script lang="ts">
  import type { User } from "../hooks";
  export let user: User = undefined,
    logoutUrl: string = "";
</script>

{#if user}
  <p>
    Logged in as: <b>{user.name}</b> ({user.email}).
    <a href={logoutUrl}>Log out</a>
  </p>

  <slot />
{:else}
  <p>Weird.</p>
{/if}
