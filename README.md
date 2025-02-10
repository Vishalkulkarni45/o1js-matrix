# o1js Matrix Library

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

o1js Matrix Library is a TypeScript library for performing matrix operations in zkApps development. Built on the o1js framework, it provides a set of functions to work with matrices and perform advanced computations in zero-knowledge proof environments.

## Features
- **Basic Operations:** Addition, Subtraction, Scalar Multiplication, Multiplication 
- **Advanced Operations:** Determinant Calculation, Adjoint, and Matrix Inversion

## Installation
Ensure that you have Node.js and npm installed, then run:
```
npm install o1js-matrix
```

## Basic Usage Example

You should explicitly add a range check on the matrix values before initializing the matrix.

```
import { Matrix } from 'o1js-matrix';
import { Field } from 'o1js';

// Define the shape of the matrices (rows, columns)
const shape = [3, 3];
const matrix1_values: Field[] = [];
const matrix2_values: Field[] = [];
const exp_out: Field[] = [];

// Populate the matrices with random Field elements and calculate expected sum
for (let i = 0; i < shape * shape; i++) {
    const val1 = Field.random();
    const val2 = Field.random();
    matrix1_values.push(val1);
    matrix2_values.push(val2);
    exp_out.push(val1.add(val2));
}

// Create the matrices while specifying dimensions and initialization parameters
const matrix1 = new Matrix(
    matrix1_values,
    [Field(shape), Field(shape)],
    Field(0), // typically used as the additive identity
    Field(1) // typically used as the multiplicative identity
);

const matrix2 = new Matrix(
    matrix2_values,
    [Field(shape), Field(shape)],
    Field(0),
    Field(1)
);

// Perform matrix addition
const out = matrix1.add(matrix2);
console.log('Expected Output:', exp_out);
console.log('Matrix Sum Output:', out);
```

This example:
- Initializes two matrices of shape 3x3.
- Fills each matrix with random Field values.
- Computes the expected output by element-wise addition.
- Uses the `add` method provided by the library to perform matrix addition.

## Advanced Operations
For more complex operations like determinant calculation and matrix inversion, refer to the advanced examples below:
```
// Compute the determinant of matrix1
const determinant = matrix1.determinant();

// Compute the inverse of matrix1
const inverse = matrix1.inverse();

console.log('Determinant:', determinant);
console.log('Inverse:', inverse);
```

## Development and Testing
This repository is built with TypeScript and uses Jest for testing. To run the tests, execute:
```
cd /src
npm test
```

## Benchmark

### How to Benchmark
```
npm run build && node build/src/run.js
```

### Preview

| Summary | Numbers |
| ------ | ------- | 
| Total Rows | 56 |
| Generic | 56 | 
| Compile time | 523.252ms | 
| Proving time | 10.672s |
| Verifying time | 372.035ms |

## License
This project is licensed under the MIT License.