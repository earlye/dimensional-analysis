import * as d from "../src/index.js"

type e3 = 3;

type E4 = d.ToNumber<[1,2,3,4]>;
d.exactType({} as e3, {} as E4);
// expected: TS2345: Argument of type 'number' is not assignable to parameter of type 'never'.
