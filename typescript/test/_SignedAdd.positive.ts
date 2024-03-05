import * as d from  "../src/index.js"

// +2 + +3
d.exactType({} as d._SignedAdd<2,3,1,1>, {} as d.SignedNumber<5,1>);

// +0 + -5 = -5
d.exactType({} as d._SignedAdd<0,5,1,-1>, {} as d.SignedNumber<5,-1>);

// +5 + -2 = +3
d.exactType({} as d._SignedAdd<5,2,1,-1>, {} as d.SignedNumber<3,1>);

// +5 + -5 = 0
d.exactType({} as d._SignedAdd<5,5,1,-1>, {} as d.SignedNumber<0,1>);
d.exactType({} as d._SignedAdd<5,5,1,-1>, {} as d.SignedNumber<0,-1>);

// -5 + 0 = -5
d.exactType({} as d._SignedAdd<5,0,-1,1>, {} as d.SignedNumber<5,-1>);

// -5 + -2 = -7
d.exactType({} as d._SignedAdd<5,2,-1,-1>, {} as d.SignedNumber<7,-1>);

// -5 + +2 = -3
d.exactType({} as d._SignedAdd<5,2,-1,1>, {} as d.SignedNumber<3,-1>);

// -5 + +8 = +3
d.exactType({} as d._SignedAdd<5,8,-1,1>, {} as d.SignedNumber<3,1>);
