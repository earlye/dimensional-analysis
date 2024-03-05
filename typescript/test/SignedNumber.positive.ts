import * as d from "../src/index.js"

type neg2 = d.SignedNumber<2,-1>; // -2
type pos2 = d.SignedNumber<2,1>;
type neg4 = d.SignedNumber<4,-1>; // -2
type pos4 = d.SignedNumber<4,1>;

d.exactType({} as neg2,{} as neg2);
d.exactType({} as pos2,{} as pos2);
