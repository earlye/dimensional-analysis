import "../src/index.js"

type neg2 = SignedNumber<2,-1>; // -2
type pos2 = SignedNumber<2,1>;
type neg4 = SignedNumber<4,-1>; // -2
type pos4 = SignedNumber<4,1>;

exactType({} as neg2,{} as neg2);
exactType({} as pos2,{} as pos2);
