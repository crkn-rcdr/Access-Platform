<script lang="ts">
  import { onDestroy, createEventDispatcher } from "svelte";
  export let threshold: number = 0;
  export let horizontal: boolean = false;
  export let elementScroll: HTMLElement;
  export let hasMore: boolean = true;
  export let hasLess: boolean = false;
  export let reverse: boolean = false;

  const dispatch = createEventDispatcher();
  let isLoadMore: boolean = false;
  let beforeScrollTop: number;
  let element: any | null;

  const onScroll = (e: Event) => {
    const target = e.target as HTMLElement;

    // Determine direction
    if (beforeScrollTop > target.scrollTop) {
      reverse = true;
    } else {
      reverse = false;
    }

    // Don't grab is theres nothing to grab
    if (!reverse && !hasMore) return;
    else if (reverse && !hasLess) return;

    // If within 'threshold' from beggining or end of list
    const offsetFromBottom = calcOffset(target, reverse, horizontal);
    if (
      (!reverse && offsetFromBottom <= threshold) ||
      (reverse && target.scrollTop <= threshold)
    ) {
      // If not already loading
      if (!isLoadMore) {
        dispatch("loadMore", { reverse });
        console.log("loading...");
        if (!reverse) element.scroll({ top: 10, behavior: "instant" });
        else element.scroll({ top: element.scrollHeight, behavior: "instant" });
      }
      isLoadMore = true;
    } else {
      isLoadMore = false;
    }

    // Record previous scroll position
    beforeScrollTop = target.scrollTop;
  };

  const calcOffset = (target: any, reverse: boolean, horizontal: boolean) => {
    const element: HTMLElement = target.documentElement
      ? target.documentElement
      : target;
    if (reverse) {
      return horizontal ? element.scrollLeft : element.scrollTop;
    }
    return horizontal
      ? element.scrollWidth - element.clientWidth - element.scrollLeft
      : element.scrollHeight - element.clientHeight - element.scrollTop;
  };
  function setElement(elementScroll) {
    if (!element && elementScroll) {
      element = elementScroll;
      element.addEventListener("scroll", onScroll);
      element.addEventListener("resize", onScroll);
    }
  }
  $: {
    setElement(elementScroll);
  }
  onDestroy(() => {
    if (element) {
      element.removeEventListener("scroll", onScroll);
      element.removeEventListener("resize", onScroll);
    }
  });
</script>
