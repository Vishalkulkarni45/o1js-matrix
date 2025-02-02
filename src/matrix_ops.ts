import { Field, Provable, Circuit, Bool } from 'o1js';

import { add_quant, sub_quant, mul_quant, div_quant } from './quantize';

export class Matrix {
    values: Field[];
    shape: [Field, Field];
    zero_point: Field;
    scale: Field;

    constructor(values: Field[], shape: [Field, Field], zero_point: Field, scale: Field) {

        if (values.length !== Number(shape[0]) * Number(shape[1])) {
            throw new Error('Values length does not match the shape');
        }

        this.values = values;
        this.shape = shape;
        this.zero_point = zero_point;
        this.scale = scale;

    }

    add(other: Matrix): Matrix {

        constr_matrix_config(this, other);
        Provable.assertEqual(Field, other.zero_point, Field(0));
        Provable.assertEqual(Field, other.scale, Field(1));

        let values = add(this.values, other.values);
        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }

    //TODO:optimize this
    quant_add(other: Matrix): Matrix {
        constr_matrix_config(this, other);

        let values: Field[] = [];
        let matrix1_values = this.values;
        let matrix2_values = other.values;

        for (let i = 0; i < matrix1_values.length; i++) {
            values.push(add_quant(matrix1_values[i], this.zero_point, this.scale, matrix2_values[i], other.zero_point, other.scale, this.zero_point, this.scale))
        }

        return new Matrix(values, this.shape, this.zero_point, this.scale);

    }

    sub(other: Matrix): Matrix {

        constr_matrix_config(this, other);
        Provable.assertEqual(Field, other.zero_point, Field(0));
        Provable.assertEqual(Field, other.scale, Field(1));

        let values = sub(this.values, other.values);
        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }

    quant_sub(other: Matrix): Matrix {
        constr_matrix_config(this, other);

        let values: Field[] = [];
        let matrix1_values = this.values;
        let matrix2_values = other.values;

        for (let i = 0; i < matrix1_values.length; i++) {
            values.push(sub_quant(matrix1_values[i], this.zero_point, this.scale, matrix2_values[i], other.zero_point, other.scale, this.zero_point, this.scale))
        }

        return new Matrix(values, this.shape, this.zero_point, this.scale);

    }

    hadamard_product(other: Matrix): Matrix {
        constr_matrix_config(this, other);
        Provable.assertEqual(Field, other.zero_point, Field(0));
        Provable.assertEqual(Field, other.scale, Field(1));

        let values = hadamard_product(this.values, other.values);
        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }

    quant_hadamard_product(other: Matrix): Matrix {
        constr_matrix_config(this, other);

        let values: Field[] = [];
        let matrix1_values = this.values;
        let matrix2_values = other.values;

        for (let i = 0; i < matrix1_values.length; i++) {
            values.push(mul_quant(matrix1_values[i], this.zero_point, this.scale, matrix2_values[i], other.zero_point, other.scale, this.zero_point, this.scale))
        }
        return new Matrix(values, this.shape, this.zero_point, this.scale);

    }

    mul(other: Matrix): Matrix {

        Provable.assertEqual(Field, other.zero_point, Field(0));
        Provable.assertEqual(Field, other.scale, Field(1));
        Provable.assertEqual(Field, this.zero_point, other.zero_point);
        Provable.assertEqual(Field, this.scale, other.scale);


        let values = mul(this.values, other.values, this.shape, other.shape);

        return new Matrix(values, [this.shape[0], other.shape[1]], this.zero_point, this.scale);
    }

    quant_mul(other: Matrix): Matrix {

        Provable.assertEqual(Field, this.zero_point, other.zero_point);
        Provable.assertEqual(Field, this.scale, other.scale);
        Provable.assertEqual(Field, this.shape[1], other.shape[0]);

        let values: Field[] = new Array(Number(this.shape[0]) * Number(other.shape[1])).fill(Field(0));

        for (let i = 0; i < this.shape[0].toBigInt(); i++) {
            for (let j = 0; j < other.shape[1].toBigInt(); j++) {
                let element = this.zero_point;
                for (let k = 0; k < this.shape[1].toBigInt(); k++) {
                    element = add_quant(mul_quant(this.values[i * Number(this.shape[1]) + k], this.zero_point, this.scale, other.values[k * Number(other.shape[1]) + j], other.zero_point, other.scale, this.zero_point, this.scale), this.zero_point, this.scale, element, this.zero_point, this.scale, this.zero_point, this.scale);
                }
                values[i * Number(other.shape[1]) + j] = element;
            }
        }

        return new Matrix(values, [this.shape[0], other.shape[1]], this.zero_point, this.scale);
    }

    scalar_mul(scalar: Field): Matrix {

        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));

        let values = scalar_mul(this.values, scalar);
        return new Matrix(values, this.shape, this.zero_point, this.scale);

    }

    quant_scalar_mul(scalar: Field): Matrix {

        let values: Field[] = [];

        for (let i = 0; i < this.values.length; i++) {
            values.push(mul_quant(this.values[i], this.zero_point, this.scale, scalar, Field(0), Field(1), this.zero_point, this.scale));
        }

        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }

    scalar_div(scalar: Field): Matrix {

        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));

        let values = scalar_div(this.values, scalar);
        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }

    quant_scalar_div(scalar: Field): Matrix {
        let values: Field[] = [];

        for (let i = 0; i < this.values.length; i++) {
            values.push(div_quant(this.values[i], this.zero_point, this.scale, scalar, Field(0), Field(1), this.zero_point, this.scale));
        }

        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }

    transpose(): Matrix {
        let values = transpose(this.values, this.shape);
        return new Matrix(values, [this.shape[1], this.shape[0]], this.zero_point, this.scale);
    }

    determinant(): Field {
        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));
        return determinant(this.values, this.shape);
    }

    quant_determinant(): Field {
        // Assert that the matrix is square
        Provable.assertEqual(Field, this.shape[0], this.shape[1]);

        let det_2x2 = sub_quant(
            mul_quant(this.values[0], this.zero_point, this.scale, this.values[3], this.zero_point, this.scale, this.zero_point, this.scale),
            this.zero_point, this.scale,
            mul_quant(this.values[1], this.zero_point, this.scale, this.values[2], this.zero_point, this.scale, this.zero_point, this.scale),
            this.zero_point, this.scale, this.zero_point, this.scale
        )

        let det_1x1 = this.values[0];

        let det_other = (() => {

            let det = this.zero_point;
            let sign = Field(1);

            // Loop through rows/columns to calculate the determinant recursively
            for (let i = 0; i < this.shape[0].toBigInt(); i++) {
                let minor = new Array(this.values.length).fill(Field(0));
                minor = get_minor(this.values, Field(0), Field(i), this.shape, minor);
                let matrix = new Matrix(minor, [this.shape[0].sub(Field(1)), this.shape[1].sub(Field(1))], this.zero_point, this.scale);
                det = add_quant(
                    det, this.zero_point, this.scale,
                    mul_quant(
                        mul_quant(sign, Field(0), Field(1), this.values[i], this.zero_point, this.scale, this.zero_point, this.scale),
                        this.zero_point, this.scale,
                        matrix.determinant(),
                        this.zero_point, this.scale, this.zero_point, this.scale
                    ),
                    this.zero_point, this.scale, this.zero_point, this.scale
                );
                sign = sign.mul(Field(-1));
            }
            return det

        })();


        let is_2x2 = this.shape[0].equals(Field(2));
        let is_1x1 = this.shape[0].equals(Field(1));

        let det = Provable.switch([is_2x2, is_1x1, is_2x2.or(is_1x1).not()], Field, [det_2x2, det_1x1, det_other]);

        return det;
    }

    adjoint(): Matrix {
        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));
        let values = adjoint(this.values, this.shape);
        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }

    quant_adjoint(): Matrix {
        Provable.assertEqual(Field, this.shape[0], this.shape[1]);

        let values = new Array(this.values.length).fill(Field(0));
        for (let i = 0; i < this.shape[0].toBigInt(); i++) {
            for (let j = 0; j < this.shape[1].toBigInt(); j++) {
                let minor = new Array(this.values.length).fill(Field(0));
                minor = get_minor(this.values, Field(i), Field(j), this.shape, minor);
                let matrix = new Matrix(minor, [this.shape[0].sub(Field(1)), this.shape[1].sub(Field(1))], this.zero_point, this.scale);
                let sign = Field(1);
                for (let k = 0; k < i + j; k++) {
                    sign = sign.mul(Field(-1));
                }
                let cofactor = mul_quant(sign, Field(0), Field(1), matrix.quant_determinant(), this.zero_point, this.scale, this.zero_point, this.scale);
                values[i * Number(this.shape[1]) + j] = cofactor;
            }
        }

        values = transpose(values, this.shape);

        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }

    inverse(): Matrix {
        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));
        let values = inverse(this.values, this.shape);
        return new Matrix(values, this.shape, this.zero_point, this.scale);

    }

    quant_inverse(): Matrix {

        Provable.assertEqual(Field, this.shape[0], this.shape[1]);
        let det = this.quant_determinant();

        det.assertNotEquals(Field(0));

        let ad_joint = this.quant_adjoint();
        let values = new Array(this.values.length).fill(Field(0));

        for (let i = 0; i < this.shape[0].toBigInt(); i++) {
            for (let j = 0; j < this.shape[1].toBigInt(); j++) {
                values[i * Number(this.shape[1]) + j] = div_quant(ad_joint.values[i * Number(this.shape[1]) + j], this.zero_point, this.scale, det, this.zero_point, this.scale, this.zero_point, this.scale);
            }
        }

        return new Matrix(values, this.shape, this.zero_point, this.scale);


    }
}



function add(matrix1_val: Field[], matrix2_val: Field[]): Field[] {

    let values: Field[] = []
    for (let i = 0; i < matrix1_val.length; i++) {
        values.push(matrix1_val[i].add(matrix2_val[i]));
    }

    return values;
}

function sub(matrix1_val: Field[], matrix2_val: Field[]): Field[] {

    let values: Field[] = []
    for (let i = 0; i < matrix1_val.length; i++) {
        values.push(matrix1_val[i].sub(matrix2_val[i]));
    }

    return values;
}

function hadamard_product(matrix1: Field[], matrix2: Field[]): Field[] {
    let result: Field[] = [];
    for (let i = 0; i < matrix1.length; i++) {
        result.push(matrix1[i].mul(matrix2[i]));
    }
    return result
}

function mul(matrix1: Field[], matrix2: Field[], matrix1_shape: [Field, Field], matrix2_shape: [Field, Field]): Field[] {

    Provable.assertEqual(Field, matrix1_shape[1], matrix2_shape[0]);
    let result: Field[] = new Array(Number(matrix1_shape[0]) * Number(matrix2_shape[1])).fill(Field(0));

    for (let i = 0; i < matrix1_shape[0].toBigInt(); i++) {
        for (let j = 0; j < matrix2_shape[1].toBigInt(); j++) {

            let element = Field(0);
            for (let k = 0; k < matrix1_shape[1].toBigInt(); k++) {
                element = element.add(matrix1[i * Number(matrix1_shape[1]) + k].mul(matrix2[k * Number(matrix2_shape[1]) + j]));
            }
            result[i * Number(matrix2_shape[1]) + j] = element;
        }
    }
    return result;
}

function scalar_mul(matrix: Field[], scalar: Field): Field[] {
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
        result.push(scalar.mul(matrix[i]));
    }
    return result;
}

function scalar_div(matrix: Field[], scalar: Field): Field[] {
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
        result[i] = matrix[i].div(scalar);
    }
    return result;
}

function transpose(matrix: Field[], shape: [Field, Field]): Field[] {
    let result = [];
    for (let i = 0; i < shape[0].toBigInt(); i++) {
        for (let j = 0; j < shape[1].toBigInt(); i++) {
            result[j * Number(shape[0]) + i] = matrix[i * Number(shape[1]) + j];
        }
    }
    return result
}

function get_minor(matrix: Field[], row: Field, col: Field, shape: [Field, Field], minor: Field[]): Field[] {
    let r = Field(-1);

    for (let i = 0; i < shape[0].toBigInt(); i++) {
        let i_not_row = Provable.if(Field(i).equals(row).not(), Bool, Bool(true), Bool(false));
        r = Provable.if(i_not_row, Field, r.add(Field(1)), r);
        let c = Field(-1);

        for (let j = 0; j < shape[1].toBigInt(); j++) {
            let j_not_col = Provable.if(Field(j).equals(col).not(), Bool, Bool(true), Bool(false));
            c = Provable.if(j_not_col, Field, c.add(Field(1)), c);
            minor[Number(r) * (Number(shape[1]) - 1) + Number(c)] = Provable.if(j_not_col, Field, matrix[i * Number(shape[1]) + j], minor[Number(r) * (Number(shape[1]) - 1) + Number(c)]);
        }

    }

    return minor;
}

function determinant(matrix: Field[], shape: [Field, Field]): Field {
    Provable.assertEqual(Field, shape[0], shape[1]);

    let det_shape_eq_2 = matrix[0].mul(matrix[3]).sub(matrix[1].mul(matrix[2]));
    let det_shape_eq_1 = matrix[0];

    let det_shape_other = (() => {
        let det = Field(0);
        let sign = Field(1);

        for (let i = 0; i < Number(shape[0]); i++) {
            let minor = new Array(matrix.length).fill(Field(0));
            minor = get_minor(matrix, Field(0), Field(i), shape, minor);
            det = det.add(sign.mul(matrix[i]).mul(determinant(minor, [shape[0].sub(Field(1)), shape[1].sub(Field(1))])));
            sign = sign.mul(Field(-1));
        }

        return det;
    })();

    let is_shape_2 = shape[0].equals(Field(2));
    let is_shape_1 = shape[0].equals(Field(1));

    let det = Provable.switch([is_shape_2, is_shape_1, is_shape_2.or(is_shape_1).not()], Field, [det_shape_eq_2, det_shape_eq_1, det_shape_other]);

    return det;
}


function adjoint(matrix: Field[], shape: [Field, Field]): Field[] {

    Provable.assertEqual(Field, shape[0], shape[1]);
    let adjoint = new Array(matrix.length).fill(Field(0));

    for (let i = 0; i < shape[0].toBigInt(); i++) {
        for (let j = 0; j < shape[1].toBigInt(); j++) {
            let minor = new Array(matrix.length).fill(Field(0));
            minor = get_minor(matrix, Field(i), Field(j), shape, minor);
            let sign = Field(1);
            for (let k = 0; k < i + j; k++) {
                sign = sign.mul(Field(-1));
            }
            let cofactor = sign.mul(determinant(minor, [shape[0].sub(Field(1)), shape[1].sub(Field(1))]));
            adjoint[i * Number(shape[1]) + j] = cofactor;
        }
    }

    adjoint = transpose(adjoint, shape);

    return adjoint;

}

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

function constr_matrix_config(matrix: Matrix, other: Matrix) {
    matrix.shape[0].equals(other.shape[0]);
    matrix.shape[1].equals(other.shape[1]);
    matrix.zero_point.equals(other.zero_point);
    matrix.scale.equals(other.scale);
}