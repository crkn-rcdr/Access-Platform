import { Noid } from "@crkn-rcdr/access-data";

export const getItemMetadataXMLFileName = function (
  noid: Noid,
  output: "dc" | "marc" | "issueinfo" | undefined
) {
  if (output === "marc") return noid + "/dmdMARC.xml";
  else if (output === "dc") return noid + "/dmdDC.xml";
  else if (output === "issueinfo") return noid + "/dmdISSUEINFO.xml";
  else return null;
};
