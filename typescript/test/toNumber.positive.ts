import "../src/index.js"

type e3 = 3;
type E3 = ToNumber<[1,2,3]>;
compileTime && exactType({} as e3, {} as E3);
