import "../src/index.js"

type e3 = 3;

type E4 = ToNumber<[1,2,3,4]>;
exactType({} as e3, {} as E4); // will fail to compile

// expected: TS2345: Argument of type 'number' is not assignable to parameter of type 'never'.
