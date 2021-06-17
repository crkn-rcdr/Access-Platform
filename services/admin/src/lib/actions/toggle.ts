/*action = (node: HTMLElement, parameters: any) => {
	update?: (parameters: any) => void,
	destroy?: () => void
}*/

import type { ToggleParams } from "$lib/types";

export function toggleable(node: HTMLElement, parameters: ToggleParams) {
  node.style.display = parameters.toggled ? parameters.display : "none";
  return {
    update: (parameters: ToggleParams) => {
      node.style.display = parameters.toggled ? parameters.display : "none";
    },
  };
}
