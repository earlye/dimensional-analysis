import * as d from  "../src/index.js"

const l = d.meters(20);
const t = d.seconds(10);
const s = d.seconds(1);
const m = d.kilograms(32);

const v:d.Velocity     = d.div(l,t);
const a:d.Acceleration = d.div(v,s);
const f:d.Force        = d.mul(m,a);
