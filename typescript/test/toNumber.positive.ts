import * as d from "../src/index.js"

type e3 = 3;
type E3 = d.ToNumber<[1,2,3]>;
d.exactType({} as e3, {} as E3);
