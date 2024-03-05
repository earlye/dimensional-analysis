import * as d from "../src/index.js"

const l = d.meters(20);
const t = d.seconds(10);

const a:d.Acceleration = d.div(l,t);
// expected: TS2322: Type 'Dimensioned<\[1, 1\], \[1, -1\], \[0, 1\]>' is not assignable to type 'Acceleration'.
