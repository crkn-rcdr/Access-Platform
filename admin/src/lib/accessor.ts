import { Accessor } from "@crkn-rcdr/accessor";
import { accessorArgs } from "../env";

console.log(accessorArgs);
export default new Accessor(...accessorArgs);
