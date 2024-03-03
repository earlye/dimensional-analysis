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

With that in mind, we recently looked at this blog post by Alexander
Smirnov,
[Compile-time functional programming in TypeScript](https://developers.mews.com/compile-time-functional-programming-in-typescript/),
where he presents a mechanism to do compile-time addition and
subtraction using the Typescript Generic Types. The basic idea is that, while Typescript does not allow direct addition, like this:

```Typescript
type Three = 1 + 2 // Syntax error. We can't add inside the compiler! 😡
```

It _does_ allow you to create types as concatenations of array types:

```Typescript
type A1 = [undefined];
type A2 = [undefined, undefined];
type A3 = [...A1, ...A2]; // A3 = A1 + A2! We CAN add inside the compiler! 😈
```

With that in mind, and the power provided by _Conditional Types_ in
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

So what is necessary to make this work?

Basically, you need to be able to use lists of signed integers as
generic/template parameters, and to perform signed arithmetic on those
parameters.

The Smirnov post shows that this is possible!

#
