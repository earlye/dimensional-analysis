import * as d from "../src/index.js"

type neg2 = d.SignedNumber<2,-1>; // -2
type pos2 = d.SignedNumber<2,1>;

d.exactType({} as neg2,{} as pos2); // shouldn't compile
// expected: TS2345: Argument of type '\[2, 1\]' is not assignable to parameter of type 'never'.
