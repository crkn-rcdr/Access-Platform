<!--
@component
### Overview
A component that shows a navigable set of pages with a side menu to allow the user to choose which page to see.

### Properties
|    |    |    |
| -- | -- | -- |
| fullPage : boolean                 | optional | If the menu that takes up the entire body of a page, or if it should be an inline menu. |
| activeIndex : number               | optional | Sets the initital active page |
| pageList: Array<SideMenuPageData>  | optional | For dynamic sidenavs. Handles generating the side menu buttons and pages dynamically through an array. Developers can use either this list or just build their menus by putting in their own template components. |

### Usage
**Dynamic Side Menu with pageList**
```  
<script>
  pageList = [
    {
      name: "Page Title",
      componentData: {
        contentComponent: <Component to be displayed in the page>,
        contentComponentProps: { ...Any properties to set in the component above },
        sideMenuPageProps: { ...Any properties to pass to the SideMenuPage component generated for this array item },
        update: () => {
          Here you can put code that should run any time the params passed into contentComponentProps are updated.
        },
      },
    },
  ];
</script>
<SideMenuContainer {pageList}>
  ...header
</SideMenuContainer>
```
**Regular Side Menu**
```
<SideMenuContainer>
  <SideMenuPageList>
    <SideMenuPageListButton>
    </SideMenuPageListButton>
  </SideMenuPageList>
  <SideMenuBody>
    <SideMenuPage>
    </SideMenuPage>
  </SideMenuBody>
</SideMenuContainer>
```
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import SideMenuBody from '$lib/components/shared/SideMenuBody.svelte';
	import SideMenuPageList from '$lib/components/shared/SideMenuPageList.svelte';
	import SideMenuPageListButton from '$lib/components/shared/SideMenuPageListButton.svelte';
	import SideMenuPage from '$lib/components/shared/SideMenuPage.svelte';
	import type { SideMenuPageData } from '$lib/types';

	/**
	 * @type {boolean}
	 */
	export let showHeader = true;

	/**
	 * @type {boolean} If the menu that takes up the entire body of a page, or if it should be an inline menu.
	 */
	export let fullPage = true;

	/**
	 * @type {number} Sets the initital active page
	 */
	export let activeIndex = 0;

	/**
	 * @type {Array<SideMenuPageData>} For dynamic sidenavs. Handles generating the side menu buttons and pages dynamically through an array. Developers can use either this list or just build their menus by putting in their own template components.
	 */
	export let pageList: Array<SideMenuPageData> = [];

	/**
	 * @type {string[]} For dynamic sidenavs. Makes it easier to generate the sidenav buttons list
	 */
	let pageNames: string[] = [];

	/**
	 * @type {any[]} For dynamic sidenavs. Makes it easier to generate the page body list
	 */
	let pageComponents: any[] = [];

	/**
	 * @type {any} For dynamic sidenavs. Keeps track of the actual instances of the components dynamically created through svelte:component.
	 */
	let instances: any = {};

	/** Handles the hiding and showing of pages based on user interaction with the menu */
	/**
	 * @type {HTMLDivElement} The wrapper container for all of the sidenav contents.
	 */
	let container: HTMLDivElement;

	/**
	 * @type {NodeListOf<Element>} The HTML elements that correspond to each page button.
	 */
	let pageButtons: NodeListOf<Element>;

	/**
	 * @type {NodeListOf<Element>} The HTML elements that correspond to each page.
	 */
	let pageBodies: NodeListOf<Element>;

	/**
	 * Uses the @var activeIndex and finds the corresponding page button in the @var pageButtons  page list to highlight. All other pages are unhighlighted.
	 * @returns void
	 */
	function setActivePageButtonClass() {
		for (let i = 0; i < pageButtons.length; i++) {
			if (i === activeIndex) pageButtons?.[i]?.classList?.add('active');
			else {
				//pageBodies?.[i]?.classList?.add("display-hidden");
				pageButtons?.[i]?.classList?.remove('active');
			}
		}
	}

	/**
	 * Uses the @var activeIndex and finds the corresponding page in the @var pageBodies  page list to display. All other pages are hidden.
	 * @returns void
	 */
	function setActivePageBody() {
		for (let i = 0; i < pageBodies.length; i++) {
			if (i === activeIndex) pageBodies?.[i]?.classList?.remove('display-hidden');
			else pageBodies?.[i]?.classList?.add('display-hidden');
		}
	}

	/**
	 * Calls @function setActivePageButtonClass and @function setActivePageBody
	 * @returns void
	 */
	function setPage() {
		setActivePageButtonClass();
		setActivePageBody();
	}

	/**
	 * Adds a statement to set the @var activeIndex of the page button in the @var pageButtons array that was clicked, upon it being clicked.
	 * Adds the @function setPage to each @var pageButtons click event.
	 * @returns void
	 */
	function enablePaging() {
		for (let i = 0; i < pageButtons.length; i++) {
			pageButtons?.[i]?.addEventListener('click', () => {
				activeIndex = i;
				setPage();
			});
		}
	}

	/**
	 * @event onMount
	 * @description When the component instance is mounted onto the dom, the @var pageButtons are grapped from the @var container, and the @var pageBodies are also grabbed. @function enablePaging and @function setPage are called.
	 */
	onMount(() => {
		pageButtons = container.querySelectorAll('.side-menu-page-list-button');
		pageBodies = container.querySelectorAll('.side-menu-page');
		enablePaging();
		setPage();
	});

	/* For dynamicly generated sidenavs. */

	/**
	 * @listens pageList
	 * @description Any time the page list changes, redraw the menus.
	 */
	$: pageNames = pageList.map((el) => el['name']);

	/**
	 * @listens pageList
	 * @description Any time the page list changes, redraw the pages.
	 */
	$: pageComponents = pageList.map((el) => el['componentData']);

	function setInstanceEvents() {
		for (const key in instances) {
			/*instances[key].$$.after_update.push(() => {
        console.log("instance", key, instances[key], pageComponents[key]);
        pageComponents[parseInt(key)].update();
      });*/

			if (pageComponents[key]?.listeners) {
				for (let [id, listener] of Object.entries(pageComponents[key].listeners)) {
					instances[key].$on(id, listener);
				}
			}
		}
	}
	/**
	 * @listens instances
	 * @description Any time the instances object changes, add a callback to each component instance that triggers the update method passed in through the SideMenuPageData objects in the pageList array property.
	 */
	$: {
		instances;
		setInstanceEvents();
	}
</script>

<div bind:this={container} class="side-menu-container">
	<div class:fixed-full-page={fullPage} class:no-header={!showHeader}>
		{#if showHeader}
			<div class="header">
				<slot name="side-menu-header" />
			</div>
		{/if}
		<div class="menu">
			<div class="auto-align auto-align__full auto-align auto-align__a-stretch auto-align">
				{#if pageList.length}
					<SideMenuPageList>
						{#each pageNames as pageName}
							<SideMenuPageListButton>{pageName}</SideMenuPageListButton>
						{/each}
					</SideMenuPageList>

					<SideMenuBody>
						<!--SideMenuPage {...pageComponents[activeIndex]["sideMenuPageProps"]}>
              <svelte:component
                this={pageComponents[activeIndex]["contentComponent"]}
                {...pageComponents[activeIndex]["contentComponentProps"]}
                bind:this={instances[activeIndex]}
              />
            </SideMenuPage-->

						{#each pageComponents as pageComponentData, i}
							<SideMenuPage {...pageComponentData['sideMenuPageProps']}>
								<svelte:component
									this={pageComponentData['contentComponent']}
									{...pageComponentData['contentComponentProps']}
									bind:this={instances[i]}
								/>
							</SideMenuPage>
						{/each}
					</SideMenuBody>
				{:else}
					<slot />
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
	.side-menu-container {
		width: 100%;
		position: relative;
	}

	.fixed-full-page {
		/*position: fixed;
    top: calc(6.5rem + var(--viewport-scaling));
    bottom: 0;
    right: 0;
    left: 0;
    margin: auto;
    max-width: 156rem;
    */

		height: calc(100vh - 10rem - var(--viewport-scaling));
	}

	/*@media (max-width: 997px) {
    .fixed-full-page {
      top: calc(9rem + var(--viewport-scaling));
      height: calc(100vh - 9rem - var(--viewport-scaling));
    }
  }

  @media (max-width: 675px) {
    .fixed-full-page {
      top: calc(12rem + var(--viewport-scaling));
      height: calc(100vh - 12rem - var(--viewport-scaling));
    }
  }*/
	.menu {
		border-radius: var(--border-radius);
		overflow: hidden;
		background: var(--light-bg);
	}

	.fixed-full-page .header {
		height: 12%;
		width: 100%;
	}
	.fixed-full-page .menu {
		height: 88%;
		width: 100%;
	}
	.fixed-full-page.no-header .menu {
		height: 100%;
	}
</style>
