// requires "exactOptionalPropertyTypes": true compiler option in tsconfig.json

// Several of these type functions are borrowed from
// https://developers.mews.com/compile-time-functional-programming-in-typescript/
//
// The underlying concept is borrowed from
// https://se.inf.ethz.ch/~meyer/publications/OTHERS/scott_meyers/dimensions.pdf

export type ToNumber<A extends Array<unknown>> = A['length'];
export type ToSignedNumber<A extends Array<unknown>, S = 1|-1> = [A['length'],S];

export type ToArray<N extends number> = _ToArray<N, []>;
export type _ToArray<N extends number, A extends Array<unknown>> =
  ToNumber<A> extends N
  ? A
  : _ToArray<N, [...A, undefined]>;

export type _Add<A extends Array<unknown>, B extends Array<unknown>> = [...A, ...B];
export type Add<A extends number, B extends number> =
  ToNumber< _Add< ToArray<A>, ToArray<B> > >;

export type _Subtract<A extends Array<unknown>, B extends Array<unknown>> =
  A extends [...infer A1, undefined] ? B extends [...infer B1, undefined]
  ? _Subtract<A1, B1> : A : A;
export type Subtract<A extends number, B extends number> =
  ToNumber< _Subtract< ToArray<A>, ToArray<B> > >;

export type _Greater<A extends Array<unknown>, B extends Array<unknown>> =
  A extends [...infer A1, undefined] ? B extends [...infer B1, undefined]
  ? _Greater<A1, B1> : true : false;
export type Greater<A extends number, B extends number> =
  _Greater< ToArray<A>, ToArray<B> >;

export type IfEquals<T, U, Y=unknown, N=never> =
  (<G>() => G extends T ? 1 : 2) extends
  (<G>() => G extends U ? 1 : 2) ? Y : N;

export declare const exactType: <T, U>(
  expected: U, // & IfEquals<T, U>,
  draft: T & IfEquals<T, U>
) => IfEquals<T, U>;

// Zero always has positive sign.
export type SignedNumber<A, AS extends 1|-1 = 1> =
  A extends 0 ? [A, 1] : [A,AS]

export type _SignedAdd<A extends number, B extends number, AS extends 1|-1, BS extends 1|-1> =
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


export type Sign<SN extends SignedNumber<unknown,1|-1>> =
  SN extends [unknown, infer S] ? S : never;

export type Magnitude<SN extends SignedNumber<number,1|-1>> =
  SN extends [infer M, 1|-1] ? M : never;

export type SignedAdd<SNL extends SignedNumber<number,1|-1>, SNR extends SignedNumber<number,1|-1>> =
  Magnitude<SNL> extends number ? Magnitude<SNR> extends number ?
  _SignedAdd<Magnitude<SNL>, Magnitude<SNR>, Sign<SNL>, Sign<SNR>>
  : never : never;

export type Negate<SN extends SignedNumber<number,1|-1>> =
  SignedNumber<Magnitude<SN>, Sign<SN> extends 1 ? -1 : 1 >

export type SignedSubtract<SNL extends SignedNumber<number,1|-1>, SNR extends SignedNumber<number,1|-1>> = SignedAdd<SNL, Negate<SNR>>;

export type Dimensioned< LENGTH, TIME, MASS> = {
  value: number,
  tag ?: [LENGTH,TIME,MASS]
};

export function mul<
  LL extends SignedNumber<number,1|-1>,
  LT extends SignedNumber<number,1|-1>,
  LM extends SignedNumber<number,1|-1>,
  RL extends SignedNumber<number,1|-1>,
  RT extends SignedNumber<number,1|-1>,
  RM extends SignedNumber<number,1|-1>
  >(L: Dimensioned<LL,LT,LM>, R: Dimensioned<RL,RT,RM>)
: Dimensioned< SignedAdd<LL,RL>, SignedAdd<LT,RT>, SignedAdd<LM,RM> > {
  return { value: L.value * R.value } as
  Dimensioned< SignedAdd<LL,RL>, SignedAdd<LT,RT>, SignedAdd<LM,RM> >;
}

export function div<
  LL extends SignedNumber<number,1|-1>,
  LT extends SignedNumber<number,1|-1>,
  LM extends SignedNumber<number,1|-1>,
  RL extends SignedNumber<number,1|-1>,
  RT extends SignedNumber<number,1|-1>,
  RM extends SignedNumber<number,1|-1>
  >(L: Dimensioned<LL,LT,LM>, R: Dimensioned<RL,RT,RM>)
: Dimensioned< SignedAdd<LL,Negate<RL>>, SignedAdd<LT,Negate<RT>>, SignedAdd<LM,Negate<RM>> > {
  return { value: L.value / R.value } as
  Dimensioned< SignedAdd<LL,Negate<RL>>, SignedAdd<LT,Negate<RT>>, SignedAdd<LM,Negate<RM>> >;
}

// These are the SI base types for length, time, and mass dimensions:
export type Scalar       = Dimensioned<SignedNumber<0,1>,SignedNumber<0,1>,SignedNumber<0,1>>;  // m^0 * s^0  * kg^0, or "no units"
export type Length       = Dimensioned<SignedNumber<1,1>,SignedNumber<0,1>,SignedNumber<0,1>>;  // m   * s^0  * kg^0, or "m"
export type Time         = Dimensioned<SignedNumber<0,1>,SignedNumber<1,1>,SignedNumber<0,1>>;  // m^0 * s^1  * kg^0, or "s"
export type Mass         = Dimensioned<SignedNumber<0,1>,SignedNumber<0,1> ,SignedNumber<1,1>>; // m   * s^-2 * kg^0, or "m/s/s"

// These are some common derived types if you only consider length, time and mass dimensions:
export type Area         = Dimensioned<SignedNumber<2,1>,SignedNumber<0,1>,SignedNumber<0,1>>;  // m^2 * s^0  * kg^0, or "m^2"
export type Volume       = Dimensioned<SignedNumber<3,1>,SignedNumber<0,1>,SignedNumber<0,1>>;  // m^3 * s^0  * kg^0, or "m^3"
export type Velocity     = Dimensioned<SignedNumber<1,1>,SignedNumber<1,-1>,SignedNumber<0,1>>; // m   * s^-1 * kg^0, or "m/s"
export type Acceleration = Dimensioned<SignedNumber<1,1>,SignedNumber<2,-1>,SignedNumber<0,1>>; // m   * s^-2 * kg^0, or "m/s/s"
export type Force        = Dimensioned<SignedNumber<1,1>,SignedNumber<2,-1>,SignedNumber<1,1>>; // kg * m * s^-2, or "kg*m/s/s"
export type Pressure     = Dimensioned<SignedNumber<1,-1>,SignedNumber<2,-1>,SignedNumber<1,1>>; // kg * m^-1 * s^-2
export type Energy       = Dimensioned<SignedNumber<2,1>,SignedNumber<2,-1>,SignedNumber<1,1>>; // kg * m^2 * s^-2
export type Power        = Dimensioned<SignedNumber<2,1>,SignedNumber<3,-1>,SignedNumber<1,1>>; // kg * m^2 * s^-3

// Some utility functions to construct dimensioned objects:
export const meters    = (value:Number) => ({value} as Length);
export const seconds   = (value:Number) => ({value} as Time);
export const kilograms = (value:Number) => ({value} as Mass);
