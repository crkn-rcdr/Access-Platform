<script context="module" lang="ts">
  import type { Load } from "@sveltejs/kit";
  type Props = { user: User; logoutUrl?: string };

  export const load: Load = ({ page, session: _session }) => {
    // TODO: type Load properly when possible
    // https://github.com/sveltejs/kit/issues/647
    const session = _session as Session;

    if (session.user) {
      const props: Props = { user: session.user };
      if (session.auth) {
        props.logoutUrl = `${session.auth.endpoint}/logout`;
      }
      return { props };
    } else if (session.user === null) {
      return {
        status: 403,
        error: new Error(
          `Could not authenticate: ${session.auth?.error || ""}`
        ),
      };
    } else {
      if (session.auth) {
        const qs = page.query.toString();
        const returnPath = page.path + (qs.length > 0 ? `?${qs}` : "");
        const returnUrl = `${session.host}${returnPath}`;
        return {
          status: 307,
          redirect: `${session.auth.endpoint}/azuread/login?redirectUrl=${returnUrl}`,
        };
      } else {
        return {
          status: 403,
          error: new Error(
            "Cannot authenticate without server authentication configuration"
          ),
        };
      }
    }
  };
</script>

<script lang="ts">
  import type { Session, User } from "$lib/types";

  export let user: User | undefined = undefined,
    logoutUrl: string = "";
</script>

{#if user}
  <nav class="site-nav">
    <p>
      Logged in as: <b>{user.name}</b> ({user.email}).
      <a href={logoutUrl}>Log out</a>
    </p>
  </nav>
  <slot />
{:else}
  <nav class="site-nav">
    <p>Weird.</p>
  </nav>
{/if}

<style>
  .site-nav {
    padding: 1.5rem 1rem;
    color: var(--dark-font);
  }

  a {
    color: var(--dark-font) !important;
  }
</style>
