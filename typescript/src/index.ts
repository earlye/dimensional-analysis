// requires "exactOptionalPropertyTypes": true compiler option in tsconfig.json

// Several of these type functions are borrowed from
// https://developers.mews.com/compile-time-functional-programming-in-typescript/
//
// The underlying concept is borrowed from
// https://se.inf.ethz.ch/~meyer/publications/OTHERS/scott_meyers/dimensions.pdf

type ToNumber<A extends Array<unknown>> = A['length'];
type ToSignedNumber<A extends Array<unknown>, S = 1|-1> = [A['length'],S];

type ToArray<N extends number> = _ToArray<N, []>;
type _ToArray<N extends number, A extends Array<unknown>> =
  ToNumber<A> extends N
  ? A
  : _ToArray<N, [...A, undefined]>;

type _Add<A extends Array<unknown>, B extends Array<unknown>> = [...A, ...B];
type Add<A extends number, B extends number> =
  ToNumber< _Add< ToArray<A>, ToArray<B> > >;

type _Subtract<A extends Array<unknown>, B extends Array<unknown>> =
  A extends [...infer A1, undefined] ? B extends [...infer B1, undefined]
  ? _Subtract<A1, B1> : A : A;
type Subtract<A extends number, B extends number> =
  ToNumber< _Subtract< ToArray<A>, ToArray<B> > >;

type _Greater<A extends Array<unknown>, B extends Array<unknown>> =
  A extends [...infer A1, undefined] ? B extends [...infer B1, undefined]
  ? _Greater<A1, B1> : true : false;
type Greater<A extends number, B extends number> =
  _Greater< ToArray<A>, ToArray<B> >;

type IfEquals<T, U, Y=unknown, N=never> =
  (<G>() => G extends T ? 1 : 2) extends
  (<G>() => G extends U ? 1 : 2) ? Y : N;

declare const exactType: <T, U>(
  expected: U, // & IfEquals<T, U>,
  draft: T & IfEquals<T, U>
) => IfEquals<T, U>

const compileTime = false;

// Zero always has positive sign.
type SignedNumber<A, AS extends 1|-1 = 1> =
  A extends 0 ? [A, 1] : [A,AS]

type _SignedAdd<A extends number, B extends number, AS extends 1|-1, BS extends 1|-1> =
  AS extends 1 ? (
    BS extends 1 ? SignedNumber< Add<A,B>, 1 > : (
      Greater<A,B> extends true ?
        SignedNumber< Subtract<A,B>, 1> :
        SignedNumber< Subtract<B,A>, -1 >
    )
  ) : ( // AS extends -1...
    BS extends -1 ? SignedNumber< Add<A,B>, -1 > : (
      Greater<A,B> extends true ?
        SignedNumber< Subtract<A,B>, -1> :
        SignedNumber< Subtract<B,A>, 1 >
    )
  );

// +2 + +3
compileTime && exactType({} as _SignedAdd<2,3,1,1>, {} as SignedNumber<5,1>); // should compile
// compileTime && exactType({} as _SignedAdd<2,3,1,1>, {} as SignedNumber<4,-1>); // shouldn't compile

// +0 + -5 = -5
compileTime && exactType({} as _SignedAdd<0,5,1,-1>, {} as SignedNumber<5,-1>);
// +5 + -2 = +3
compileTime && exactType({} as _SignedAdd<5,2,1,-1>, {} as SignedNumber<3,1>);
// +5 + -5 = 0
compileTime && exactType({} as _SignedAdd<5,5,1,-1>, {} as SignedNumber<0,1>);
compileTime && exactType({} as _SignedAdd<5,5,1,-1>, {} as SignedNumber<0,-1>);

// -5 + 0 = -5
compileTime && exactType({} as _SignedAdd<5,0,-1,1>, {} as SignedNumber<5,-1>);

// -5 + -2 = -7
compileTime && exactType({} as _SignedAdd<5,2,-1,-1>, {} as SignedNumber<7,-1>);

// -5 + +2 = -3
compileTime && exactType({} as _SignedAdd<5,2,-1,1>, {} as SignedNumber<3,-1>);

// -5 + +8 = +3
compileTime && exactType({} as _SignedAdd<5,8,-1,1>, {} as SignedNumber<3,1>);

type Sign<SN extends SignedNumber<unknown,1|-1>> =
  SN extends [unknown, infer S] ? S : never;

type Magnitude<SN extends SignedNumber<number,1|-1>> =
  SN extends [infer M, 1|-1] ? M : never;

type SignedAdd<SNL extends SignedNumber<number,1|-1>, SNR extends SignedNumber<number,1|-1>> =
  Magnitude<SNL> extends number ? Magnitude<SNR> extends number ?
  _SignedAdd<Magnitude<SNL>, Magnitude<SNR>, Sign<SNL>, Sign<SNR>>
  : never : never;

type Negate<SN extends SignedNumber<number,1|-1>> =
  SignedNumber<Magnitude<SN>, Sign<SN> extends 1 ? -1 : 1 >

type Dimensioned<LENGTH,TIME> = {
  value: number,
  tag ?: [LENGTH,TIME],
};

function mul<
  LL extends SignedNumber<number,1|-1>,
  LT extends SignedNumber<number,1|-1>,
  RL extends SignedNumber<number,1|-1>,
  RT extends SignedNumber<number,1|-1>
  >(L: Dimensioned<LL,LT>, R: Dimensioned<RL,RT>)
: Dimensioned< SignedAdd<LL,RL>, SignedAdd<LT,RT> > {
  return { value: L.value * R.value } as
  Dimensioned< SignedAdd<LL,RL>, SignedAdd<LT,RT> >;
}

function div<
  LL extends SignedNumber<number,1|-1>,
  LT extends SignedNumber<number,1|-1>,
  RL extends SignedNumber<number,1|-1>,
  RT extends SignedNumber<number,1|-1>
  >(L: Dimensioned<LL,LT>, R: Dimensioned<RL,RT>)
: Dimensioned< SignedAdd<LL,Negate<RL>>, SignedAdd<LT,Negate<RT>> > {
  return { value: L.value / R.value } as
  Dimensioned< SignedAdd<LL,Negate<RL>>, SignedAdd<LT,Negate<RT>> >;
}

type Scalar       = Dimensioned<SignedNumber<0,1>,SignedNumber<0,1>>;  // m^0 * s^0 , or "no units"
type Length       = Dimensioned<SignedNumber<1,1>,SignedNumber<0,1>>;  // m   * s^0 , or "m"
type Area         = Dimensioned<SignedNumber<2,1>,SignedNumber<0,1>>;  // m^2 * s^0 , or "m^2"
type Volume       = Dimensioned<SignedNumber<3,1>,SignedNumber<0,1>>;  // m^3 * s^0 , or "m^3"
type Time         = Dimensioned<SignedNumber<0,1>,SignedNumber<1,1>>;  // m^0 * s^1 , or "s"
type Velocity     = Dimensioned<SignedNumber<1,1>,SignedNumber<1,-1>>; // m   * s^-1, or "m/s"
type Acceleration = Dimensioned<SignedNumber<1,1>,SignedNumber<2,-1>>; // m   * s^-2, or "m/s/s"

const l:Length = {value:20};
const t:Time = {value:10};
const s:Time = {value:1};

const v:Velocity     = div(l,t);
const a:Acceleration = div(v,s);

// const shouldFail:Volume = div(l,t); // This does fail if uncommented.
console.log(v,a);
