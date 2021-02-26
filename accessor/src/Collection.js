// const nano = getNano();

// will extend SpecObject
export class Collection {
  static async get(id) {}

  constructor(doc) {
    this.id = doc._id;
    // this.members = doc.members || [];
  }

  // addMembers(members) {
  //   this.members.push(...members);
  // }
}
