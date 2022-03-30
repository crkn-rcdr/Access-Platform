import fetch from "node-fetch";
import { Env } from "@crkn-rcdr/access-env";
import { Noid } from "@crkn-rcdr/access-data";

type MinterReturn = {
  ids: Noid[];
};

export function initializeNoid() {
  const { noid } = Env.parse(process.env);

  const mint = async (number: number): Promise<Noid[]> => {
    if (!Number.isInteger(number) || number < 1)
      throw new Error(`Cannot mint ${number} noids.`);

    const url = `${noid.url}/mint/${number}/generic`;
    const response = await fetch(url, { method: "POST" });
    const minterReturn: MinterReturn = await response.json();

    return minterReturn.ids;
  };

  const mintOne = async (): Promise<Noid> => {
    return (await mint(1))[0] as Noid;
  };

  return {
    mint,
    mintOne,
  };
}
