# Compile-Time Dimensional Analysis in Typescript
Early Ehlinger

## Introduction

One of the things I really appreciate as an engineer working at
Earnest is the opportunity to participate in the Engineering Learning
Club. We meet fortnightly, and explore a wide variety of topics,
including event-sourcing and other distributed system architectures,
machine learning, functional programming, the Go programming language,
and recently, Typescript.

Although we do typically try to tie our studies back to our work, we
also recognize that knowledge for knowledge sake is valuable and look
into things that are wholly unrelated to our mission to make higher
education affordable to all. Besides, it is the case that many
innovations come about precisely because somebody makes an unexpected
connection between seeminly unrelated domains.

We recently looked at this blog post by Alexander Smirnov,
[Compile-time functional programming in TypeScript](https://developers.mews.com/compile-time-functional-programming-in-typescript/),
where he presents a mechanism to do compile-time addition and
subtraction using the Typescript Generic Types. The basic idea is
that, while Typescript does not allow direct addition, like this:

```Typescript
type Three = 1 + 2 // Syntax error. We can't add inside the compiler! 😡
```

It _does_ allow you to create types as concatenations of array types:

```Typescript
type A1 = [undefined];
type A2 = [undefined, undefined];
type A3 = [...A1, ...A2]; // A3 = A1 + A2! We CAN add inside the compiler! 😈
```

By combining this with the power provided by _Conditional Types_ in
TypeScript 2.8, Smirnov proceeds to show us how to switch back and
forth between representing numbers as, well, numbers, and representing
them as arrays of a given length.

## The old days of C++ Dimensional Analysis

Upon seeing this, I was reminded of a 1994 book by Barton and Nackman
(okay, the 1995 excerpt in C++ Journal) where they presented a library
for performing dimensional analysis at compile time in C++ using
templates. A quick introduction for those who may not be familiar:

It is common in physics and engineering to double-check one's work by
carrying units through the mathematical gyrations one goes through to
arrive at a solution, and verify that the units make sense. For
example, if you are asked to find the acceleration of an object, and
you divide a distance by time, you will get units of
meters/second. When you compare this against the expected type for
acceleration, meters/second/second, you will very quickly notice that
you have made an error somewhere, and have to go back and correct your
work.

However, in computing, it's not entirely uncommon to just represent
physical values solely as numbers:

```Typescript
const l = 14; // meters
const t = 2; // seconds

const a = l/t; // this compiles. If we had dimensional
  // analysis, we'd know that the resulting type is
  // "meters/second" rather than "meters/second/second"
```

In the book above, Barton and Nackman show that you can use the C++
templating engine to perform these checks for you:

```C++
auto l = 14 * meters; // updated a little to modern C++ syntax
auto t = 2 * seconds;

acceleration a = l / t;
  // error: cannot assign dimensioned<double,1,-1,0,0,0,0,0>
  // to dimensioned<double,1,-2,0,0,0,0,0>
```

What's more, because the C++ templates do not use any dynamic types
(no virtual functions), an optimizer can very easily have this devolve
directly to loading the values 14 and 2 into registers and then
dividing (or better, just storing 7 directly into `a`.) In other
words, there is theoretically no run-time cost to using this library.

Scott Meyers has a short PDF describing the technique in C++
[here](https://se.inf.ethz.ch/~meyer/publications/OTHERS/scott_meyers/dimensions.pdf).

So what is necessary to make this work in a given language?

Basically, you need to be able to use lists of signed integers as
generic/template parameters, and to perform signed addition on those
parameters.

The Smirnov post shows that this is possible in Typescript!

# Dimensional Analysis in Typescript

Typescript allows us to have a generic parameter list of signed
integers. However, it does not _directly_ let us perform signed
addition on those parameters. What we need is a library that helps us
perform signed addition. Smirnov showed us how to convert numbers into
a different domain, _array-length-domain_. Unfortunately, adding and
subtracting numbers in array length domain can only be doned with
positive numbers, and then only with positive numbers in the proper
order. I.e., `5-2` will result in `3`, but `2-5` will result in `0`
rather than `-3`, because there is no such thing as a negative length
array.

We get around this by creating a tuple type `SignedNumber<M,S>`, where
`M` is the magnitude of the number we're trying to represent, and `S`
is the sign. We then implement `SignedAdd` to be the result of adding
two signed numbers. We provide a `Negate` type that provides the - you
guessed it - negation of its parameter. `SignedSubtract` is just
`SignedAdd` where you negate the second parameter.

Creating a dimensioned type is then just a matter of specifying a
series of `SignedNumber<>` generic parameters, one for each unit:
length, time, and mass. There are 4 other base dimensions in the SI
model: current, temperature, amount of substance (moles), and luminous
intensity. We chose not to implement them in the interest of having the code
be _somewhat_ readable.

The bookkeeping around dimensions is done by providing two generic
functions: `div` and `mul`, which are responsible not only for
dividing and multiplying, but performing the `SignedAdd` on the
generic arguments for the provided dimensioned types. For example:

```
import * as d from  "../src/index.js"

const l = d.meters(20);
const t = d.seconds(10);
const s = d.seconds(1);
const m = d.kilograms(32);

const v:d.Velocity     = d.div(l,t);
const a:d.Acceleration = d.div(v,s);
const f:d.Force        = d.mul(m,a);
```

Here we calculate first a velocity, by dividing a distance of 20
meters by a time period of 10 seconds. Next, we divide that velocity
by another time period of 1 second, to obtain an
acceleration. Finally, we multiply that acceleration by a mass to
obtain a force. The type system disallows storing the result of
`d.mul(m,a)` into, say, a d.Acceleration, because the resulting
exponent for the mass dimension from the d.mul call is 1.

# Shortcomings

Typescript does not offer operator overloading, and as a consequence
we are forced to explicitly call utility functions, e.g., `d.div` and
`d.mul`, in order to do any math on the value of our dimensioned
objects. This is a mild annoyance compared to languages like C++ where you
could write the equations above in a more human-friendly style:

```
Velocity const v = l / t;
Accelaration const a = v / s;
Force const f = m * a;
```

There are several proposals to add operator overloading to
Typescript. It doesn't appear likely that any will be accepted, but
one can dream :-).

# Next steps

There are a number of steps that one could take to make improvements
to the library as it currently stands, that we are choosing not to take
at this time:

1. Place into an npm package for easier consumption and reuse.

2. Provide library support for conversions. That is, provide
conversion factors for the varied SI prefixes (nano, mili, kilo, mega,
exa, etc.), as well as conversion factors for other systems like
imperial, ancient Roman, etc. If these are tracked intelligently, it
could help with numeric precision issues that floating point numbers
introduce. For example, if we try to track areas or volumes that ought
to be expressed in light-year scales as meters, then the fact that
`Number` is a floating point value will cause numerical problems. But
if we can store in the type system that an object is not only a
length, but a length at light-year scale, then we can keep the
magnitude of our numbers smaller and the precision higher.

3. Support all 7 SI base units and all of the common derived units.

The code is available [here](https://github.com/earlye/dimensional-analysis)
