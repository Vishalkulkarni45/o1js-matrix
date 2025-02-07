/*
 * Matrix.ts
 *
 * Implementation of a Matrix class for performing arithmetic operations on matrices composed
 * of field elements using the o1js library.
 *
 * Each Matrix instance contains:
 * - values: An array of Field elements representing the matrix entries in row-major order.
 * - shape: A tuple [rows, columns] (both are Field elements) representing the dimensions.
 * - zero_point: The zero-point offset used for quantization.
 * - scale: The scale factor used for quantization.
 *
 * This module provides methods for common matrix operations such as addition, subtraction,
 * Hadamard product (element-wise multiplication), matrix multiplication, scalar multiplication/division,
 * transpose, determinant calculation, and computation of adjugate and inverse matrices.
 */

import { Field, Provable, Circuit, Bool } from 'o1js';

/**
 * Matrix class for field-based matrix arithmetic.
 */
export class Matrix {
  values: Field[];
  shape: [Field, Field];
  zero_point: Field;
  scale: Field;

  /**
   * Constructs a new Matrix instance.
   *
   * @param values - The array of Field elements representing the matrix entries.
   * @param shape - The shape of the matrix as a tuple [rows, columns].
   * @param zero_point - The quantization zero-point offset.
   * @param scale - The quantization scale factor.
   * @throws Error if the number of values does not match the specified shape.
   */
  constructor(values: Field[], shape: [Field, Field], zero_point: Field, scale: Field) {
    // Ensure the number of values matches the product of the dimensions.
    if (values.length !== Number(shape[0]) * Number(shape[1])) {
      throw new Error('Values length does not match the shape');
    }

    this.values = values;
    this.shape = shape;
    this.zero_point = zero_point;
    this.scale = scale;
  }

  /**
   * Adds the current matrix with another matrix element-wise.
   * Ensures matrices have the same configuration and that the other matrix has default quantization.
   *
   * @param other - The matrix to add.
   * @returns A new Matrix instance with the summed values.
   */
  add(other: Matrix): Matrix {
    constr_matrix_config(this, other);
    Provable.assertEqual(Field, other.zero_point, Field(0));
    Provable.assertEqual(Field, other.scale, Field(1));

    let values = add(this.values, other.values);
    return new Matrix(values, this.shape, this.zero_point, this.scale);
  }

  /**
   * Subtracts another matrix from the current matrix element-wise.
   * Ensures matrices have the same configuration and that the other matrix has default quantization.
   *
   * @param other - The matrix to subtract.
   * @returns A new Matrix instance with the subtracted values.
   */
  sub(other: Matrix): Matrix {
    constr_matrix_config(this, other);
    Provable.assertEqual(Field, other.zero_point, Field(0));
    Provable.assertEqual(Field, other.scale, Field(1));

    let values = sub(this.values, other.values);
    return new Matrix(values, this.shape, this.zero_point, this.scale);
  }

  /**
   * Computes the Hadamard product (element-wise multiplication) with another matrix.
   * Ensures matrices have the same configuration and that the other matrix has default quantization.
   *
   * @param other - The matrix to multiply element-wise.
   * @returns A new Matrix instance with the Hadamard product values.
   */
  hadamard_product(other: Matrix): Matrix {
    constr_matrix_config(this, other);
    Provable.assertEqual(Field, other.zero_point, Field(0));
    Provable.assertEqual(Field, other.scale, Field(1));

    let values = hadamard_product(this.values, other.values);
    return new Matrix(values, this.shape, this.zero_point, this.scale);
  }

  /**
   * Performs matrix multiplication with another matrix.
   * Verifies that the inner dimensions match and that quantization parameters are consistent.
   *
   * @param other - The matrix to multiply with.
   * @returns A new Matrix instance representing the product with updated dimensions.
   */
  mul(other: Matrix): Matrix {
    Provable.assertEqual(Field, other.zero_point, Field(0));
    Provable.assertEqual(Field, other.scale, Field(1));
    Provable.assertEqual(Field, this.zero_point, other.zero_point);
    Provable.assertEqual(Field, this.scale, other.scale);

    let values = mul(this.values, other.values, this.shape, other.shape);
    return new Matrix(values, [this.shape[0], other.shape[1]], this.zero_point, this.scale);
  }

  /**
   * Multiplies every element of the matrix by a scalar.
   * Assumes default quantization parameters (zero_point = 0 and scale = 1).
   *
   * @param scalar - The scalar by which to multiply the matrix.
   * @returns A new Matrix instance with elements scaled by the given scalar.
   */
  scalar_mul(scalar: Field): Matrix {
    Provable.assertEqual(Field, this.zero_point, Field(0));
    Provable.assertEqual(Field, this.scale, Field(1));

    let values = scalar_mul(this.values, scalar);
    return new Matrix(values, this.shape, this.zero_point, this.scale);
  }

  /**
   * Divides every element of the matrix by a scalar.
   * Assumes default quantization parameters (zero_point = 0 and scale = 1).
   *
   * @param scalar - The scalar by which to divide the matrix.
   * @returns A new Matrix instance with elements divided by the given scalar.
   */
  scalar_div(scalar: Field): Matrix {
    Provable.assertEqual(Field, this.zero_point, Field(0));
    Provable.assertEqual(Field, this.scale, Field(1));

    let values = scalar_div(this.values, scalar);
    return new Matrix(values, this.shape, this.zero_point, this.scale);
  }

  /**
   * Returns the transpose of the current matrix.
   *
   * @returns A new Matrix instance that is the transpose of the current matrix.
   */
  transpose(): Matrix {
    let values = transpose(this.values, this.shape);
    // Swap the dimensions in the shape tuple.
    return new Matrix(values, [this.shape[1], this.shape[0]], this.zero_point, this.scale);
  }

  /**
   * Computes the determinant of a square matrix.
   * Assumes default quantization parameters (zero_point = 0 and scale = 1).
   *
   * @returns The determinant as a Field element.
   */
  determinant(): Field {
    Provable.assertEqual(Field, this.zero_point, Field(0));
    Provable.assertEqual(Field, this.scale, Field(1));
    return determinant(this.values, this.shape);
  }

  /**
   * Computes the adjugate (adjoint) matrix of a square matrix.
   * Assumes default quantization parameters (zero_point = 0 and scale = 1).
   *
   * @returns A new Matrix instance representing the adjugate.
   */
  adjoint(): Matrix {
    Provable.assertEqual(Field, this.zero_point, Field(0));
    Provable.assertEqual(Field, this.scale, Field(1));
    let values = adjoint(this.values, this.shape);
    return new Matrix(values, this.shape, this.zero_point, this.scale);
  }

  /**
   * Computes the inverse of a square matrix.
   * Assumes default quantization parameters (zero_point = 0 and scale = 1).
   *
   * @returns A new Matrix instance representing the inverse.
   * @throws An error if the determinant is zero (i.e., the matrix is non-invertible).
   */
  inverse(): Matrix {
    Provable.assertEqual(Field, this.zero_point, Field(0));
    Provable.assertEqual(Field, this.scale, Field(1));
    let values = inverse(this.values, this.shape);
    return new Matrix(values, this.shape, this.zero_point, this.scale);
  }
}

/* Helper Functions */

/**
 * Performs element-wise addition of two arrays representing matrix values.
 *
 * @param matrix1_val - The first array of Field elements.
 * @param matrix2_val - The second array of Field elements.
 * @returns An array of Field elements representing the element-wise sum.
 */
function add(matrix1_val: Field[], matrix2_val: Field[]): Field[] {
  let values: Field[] = [];
  for (let i = 0; i < matrix1_val.length; i++) {
    values.push(matrix1_val[i].add(matrix2_val[i]));
  }
  return values;
}

/**
 * Performs element-wise subtraction of two arrays representing matrix values.
 *
 * @param matrix1_val - The first array of Field elements.
 * @param matrix2_val - The second array of Field elements.
 * @returns An array of Field elements representing the element-wise difference.
 */
function sub(matrix1_val: Field[], matrix2_val: Field[]): Field[] {
  let values: Field[] = [];
  for (let i = 0; i < matrix1_val.length; i++) {
    values.push(matrix1_val[i].sub(matrix2_val[i]));
  }
  return values;
}

/**
 * Performs element-wise multiplication (Hadamard product) of two matrices.
 *
 * @param matrix1 - The first array of Field elements.
 * @param matrix2 - The second array of Field elements.
 * @returns An array of Field elements representing the Hadamard product.
 */
function hadamard_product(matrix1: Field[], matrix2: Field[]): Field[] {
  let result: Field[] = [];
  for (let i = 0; i < matrix1.length; i++) {
    result.push(matrix1[i].mul(matrix2[i]));
  }
  return result;
}

/**
 * Performs matrix multiplication between two matrices represented by their values and shapes.
 *
 * @param matrix1 - The array of Field elements for the first matrix.
 * @param matrix2 - The array of Field elements for the second matrix.
 * @param matrix1_shape - The shape (rows, columns) of the first matrix.
 * @param matrix2_shape - The shape (rows, columns) of the second matrix.
 * @returns An array of Field elements representing the resulting matrix multiplication.
 */
function mul(
  matrix1: Field[],
  matrix2: Field[],
  matrix1_shape: [Field, Field],
  matrix2_shape: [Field, Field]
): Field[] {
  // Ensure the number of columns in the first matrix equals the number of rows in the second matrix.
  Provable.assertEqual(Field, matrix1_shape[1], matrix2_shape[0]);
  let result: Field[] = new Array(Number(matrix1_shape[0]) * Number(matrix2_shape[1])).fill(Field(0));

  // Loop over rows of the first matrix.
  for (let i = 0; i < matrix1_shape[0].toBigInt(); i++) {
    // Loop over columns of the second matrix.
    for (let j = 0; j < matrix2_shape[1].toBigInt(); j++) {
      let element = Field(0);
      // Compute the dot product of the row and column.
      for (let k = 0; k < matrix1_shape[1].toBigInt(); k++) {
        element = element.add(
          matrix1[i * Number(matrix1_shape[1]) + k].mul(
            matrix2[k * Number(matrix2_shape[1]) + j]
          )
        );
      }
      result[i * Number(matrix2_shape[1]) + j] = element;
    }
  }
  return result;
}

/**
 * Multiplies every element of the matrix by a scalar.
 *
 * @param matrix - The array of Field elements representing the matrix.
 * @param scalar - The scalar Field element to multiply with.
 * @returns An array of Field elements representing the scaled matrix.
 */
function scalar_mul(matrix: Field[], scalar: Field): Field[] {
  let result = [];
  for (let i = 0; i < matrix.length; i++) {
    result.push(scalar.mul(matrix[i]));
  }
  return result;
}

/**
 * Divides every element of the matrix by a scalar.
 * Throws an error if the scalar is zero.
 *
 * @param matrix - The array of Field elements representing the matrix.
 * @param scalar - The scalar Field element by which to divide.
 * @returns An array of Field elements representing the matrix after division.
 */
function scalar_div(matrix: Field[], scalar: Field): Field[] {
  scalar.assertNotEquals(Field(0), "Division by zero");
  let result = [];
  for (let i = 0; i < matrix.length; i++) {
    result[i] = matrix[i].div(scalar);
  }
  return result;
}

/**
 * Transposes a matrix represented by its values and shape.
 *
 * @param matrix_values - The array of Field elements for the original matrix.
 * @param shape - The shape of the matrix as a tuple [rows, columns].
 * @returns An array of Field elements representing the transposed matrix.
 */
function transpose(matrix_values: Field[], shape: [Field, Field]): Field[] {
  let result: Field[] = new Array(matrix_values.length).fill(Field(0));
  for (let i = 0; i < Number(shape[0]); i++) {
    for (let j = 0; j < Number(shape[1]); j++) {
      result[j * Number(shape[0]) + i] = matrix_values[i * Number(shape[1]) + j];
    }
  }
  return result;
}

/**
 * Computes the minor of a matrix by removing the specified row and column.
 * This function is used in determinant and adjugate calculations.
 *
 * @param matrix - The array of Field elements representing the original matrix.
 * @param row - The row index (as a Field) to remove.
 * @param col - The column index (as a Field) to remove.
 * @param shape - The shape of the original matrix.
 * @param minor - An array to store the computed minor values.
 * @returns The minor matrix as an array of Field elements.
 */
function get_minor(matrix: Field[], row: Field, col: Field, shape: [Field, Field], minor: Field[]): Field[] {
  let native_minor: Field[] = new Array(Number(shape[0]) * Number(shape[1])).fill(Field(0));

  let r = -1;

  for (let i = 0; i < Number(shape[0]); i++) {
    if (i != Number(row)) {
      r += 1;
      let c = -1;
      for (let j = 0; j < Number(shape[1]); j++) {
        if (j != Number(col)) {
          c += 1;
          let minor_idx = r * (Number(shape[1]) - 1) + c;
          native_minor[minor_idx] = matrix[i * Number(shape[1]) + j];
          minor[minor_idx] = Provable.witness(Field, () => native_minor[minor_idx]);
          Provable.assertEqual(Field, minor[minor_idx], matrix[i * Number(shape[1]) + j]);
        }
      }
    }
  }

  return minor;
}

/**
 * Recursively computes the determinant of a square matrix.
 *
 * @param matrix - The array of Field elements representing the matrix.
 * @param shape - The shape of the matrix; must be square.
 * @returns The determinant as a Field element.
 */
function determinant(matrix: Field[], shape: [Field, Field]): Field {
  Provable.assertEqual(Field, shape[0], shape[1]);

  if (Number(shape[0]) == 2) {
    // For a 2x2 matrix, use the shortcut formula: ad - bc
    return matrix[0].mul(matrix[3]).sub(matrix[1].mul(matrix[2]));
  } else if (Number(shape[0]) == 1) {
    return matrix[0];
  } else {
    let det = Field(0);
    let sign = Field(1);

    // Expand along the first row.
    for (let i = 0; i < Number(shape[0]); i++) {
      let minor = new Array((Number(shape[0]) - i) * (Number(shape[0]) - i)).fill(Field(0));
      minor = get_minor(matrix, Field(0), Field(i), shape, minor);
      det = det.add(
        sign.mul(matrix[i]).mul(
          determinant(minor, [
            shape[0].sub(Field(1)),
            shape[1].sub(Field(1))
          ])
        )
      );
      sign = sign.mul(Field(-1));
    }

    return det;
  }
}

/**
 * Computes the adjugate (adjoint) of a square matrix.
 *
 * @param matrix - The array of Field elements representing the matrix.
 * @param shape - The shape of the square matrix.
 * @returns An array of Field elements representing the adjugate matrix.
 */
function adjoint(matrix: Field[], shape: [Field, Field]): Field[] {
  Provable.assertEqual(Field, shape[0], shape[1]);
  let adjoint = new Array(matrix.length).fill(Field(0));

  for (let i = 0; i < shape[0].toBigInt(); i++) {
    for (let j = 0; j < shape[1].toBigInt(); j++) {
      let minor = new Array(matrix.length).fill(Field(0));
      minor = get_minor(matrix, Field(i), Field(j), shape, minor);
      let sign = Field(1);
      // Determine the sign based on the position (i, j)
      for (let k = 0; k < i + j; k++) {
        sign = sign.mul(Field(-1));
      }
      let cofactor = sign.mul(
        determinant(minor, [shape[0].sub(Field(1)), shape[1].sub(Field(1))])
      );
      adjoint[i * Number(shape[1]) + j] = cofactor;
    }
  }

  // Transpose the cofactor matrix to obtain the adjugate.
  adjoint = transpose(adjoint, shape);

  return adjoint;
}

/**
 * Computes the inverse of a square matrix.
 * It uses the formula: inverse = (adjugate) / (determinant).
 *
 * @param matrix - The array of Field elements representing the matrix.
 * @param shape - The shape of the square matrix.
 * @returns An array of Field elements representing the inverse matrix.
 * @throws Error if the determinant is zero.
 */
function inverse(matrix: Field[], shape: [Field, Field]): Field[] {
  Provable.assertEqual(Field, shape[0], shape[1]);
  let det = determinant(matrix, shape);
  det.assertNotEquals(Field(0));
  let ad_joint = adjoint(matrix, shape);

  let inverse = new Array(matrix.length).fill(Field(0));

  for (let i = 0; i < shape[0].toBigInt(); i++) {
    for (let j = 0; j < shape[1].toBigInt(); j++) {
      inverse[i * Number(shape[1]) + j] = ad_joint[i * Number(shape[1]) + j].div(det);
    }
  }

  return inverse;
}

/**
 * Checks that two Matrix instances have the same configuration.
 * It asserts that their shapes, zero_point, and scale are identical.
 *
 * @param matrix - The first Matrix instance.
 * @param other - The second Matrix instance.
 */
function constr_matrix_config(matrix: Matrix, other: Matrix) {
  matrix.shape[0].equals(other.shape[0]).assertEquals(true);
  matrix.shape[1].equals(other.shape[1]).assertEquals(true);
  matrix.zero_point.equals(other.zero_point).assertEquals(true);
  matrix.scale.equals(other.scale).assertEquals(true);
}
