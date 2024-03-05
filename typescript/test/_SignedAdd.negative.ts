import * as d from "../src/index.js"

d.exactType({} as d._SignedAdd<2,3,1,1>, {} as d.SignedNumber<4,-1>);
// expected: TS2345: Argument of type '\[4, -1\]' is not assignable to parameter of type 'never'.
