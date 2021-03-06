import IAccessObject from "@crkn-rcdr/access-data/dist/Access/Object";
import Noid from "@crkn-rcdr/access-data/dist/Format/Noid";

export default abstract class AccessObject {
  readonly id: Noid;

  constructor(obj: IAccessObject) {
    this.id = obj.id;
  }
}
