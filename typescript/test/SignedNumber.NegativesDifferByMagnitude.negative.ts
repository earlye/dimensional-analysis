import "../src/index.js"

type neg2 = SignedNumber<2,-1>; // -2
type neg4 = SignedNumber<4,-1>; // -2

exactType({} as neg4,{} as neg2);
// expected: TS2345: Argument of type '\[2, -1\]' is not assignable to parameter of type 'never'.
