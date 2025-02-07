import { Field, Provable, Circuit, Bool } from 'o1js';

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

    sub(other: Matrix): Matrix {

        constr_matrix_config(this, other);
        Provable.assertEqual(Field, other.zero_point, Field(0));
        Provable.assertEqual(Field, other.scale, Field(1));

        let values = sub(this.values, other.values);
        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }


    hadamard_product(other: Matrix): Matrix {
        constr_matrix_config(this, other);
        Provable.assertEqual(Field, other.zero_point, Field(0));
        Provable.assertEqual(Field, other.scale, Field(1));

        let values = hadamard_product(this.values, other.values);
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


    scalar_mul(scalar: Field): Matrix {

        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));

        let values = scalar_mul(this.values, scalar);
        return new Matrix(values, this.shape, this.zero_point, this.scale);

    }

    scalar_div(scalar: Field): Matrix {

        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));

        let values = scalar_div(this.values, scalar);
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

    adjoint(): Matrix {
        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));
        let values = adjoint(this.values, this.shape);
        return new Matrix(values, this.shape, this.zero_point, this.scale);
    }


    inverse(): Matrix {
        Provable.assertEqual(Field, this.zero_point, Field(0));
        Provable.assertEqual(Field, this.scale, Field(1));
        let values = inverse(this.values, this.shape);
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
    scalar.assertEquals(Field(0), "Division by zero");
    let result = [];
    for (let i = 0; i < matrix.length; i++) {
        result[i] = matrix[i].div(scalar);
    }
    return result;
}

function transpose(matrix_values: Field[], shape: [Field, Field]): Field[] {
    let result: Field[] = new Array(matrix_values.length).fill(Field(0));
    for (let i = 0; i < Number(shape[0]); i++) {
        for (let j = 0; j < Number(shape[1]); j++) {
            result[j * Number(shape[0]) + i] = matrix_values[i * Number(shape[1]) + j];
        }
    }
    return result
}

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

    return minor

}



function determinant(matrix: Field[], shape: [Field, Field]): Field {
    Provable.assertEqual(Field, shape[0], shape[1]);

    if (Number(shape[0]) == 2) {
        return matrix[0].mul(matrix[3]).sub(matrix[1].mul(matrix[2]));
    }
    else if (Number(shape[0]) == 1) {
        return matrix[0];
    }

    else {
        let det = Field(0);
        let sign = Field(1);

        for (let i = 0; i < Number(shape[0]); i++) {
            let minor = new Array((Number(shape[0]) - i) * (Number(shape[0]) - i)).fill(Field(0));
            minor = get_minor(matrix, Field(0), Field(i), shape, minor);
            det = det.add(sign.mul(matrix[i]).mul(determinant(minor, [shape[0].sub(Field(1)), shape[1].sub(Field(1))])));
            sign = sign.mul(Field(-1));
        }

        return det;

    }


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
    matrix.shape[0].equals(other.shape[0]).assertEquals(true);
    matrix.shape[1].equals(other.shape[1]).assertEquals(true);
    matrix.zero_point.equals(other.zero_point).assertEquals(true);
    matrix.scale.equals(other.scale).assertEquals(true);
    matrix.scale.assertGreaterThan(Field(0), "Scale must be positive");
}