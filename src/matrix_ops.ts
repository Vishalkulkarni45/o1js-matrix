import { Field, Provable } from 'o1js';

export class Matrix {
    values: Field[];
    values_len: Field;
    shape: [Field, Field];
    zero_point: Field;
    scale: Field;

    constructor(values: Field[], exp_values_len: Field, shape: [Field, Field], zero_point: Field, scale: Field) {

        //Is it better to use if branch in this case? Does the below is a circuit constrain ot ts checker
        let values_len = Field(values.length);
        values_len.equals(exp_values_len);

        this.values = values;
        this.values_len = values_len;
        this.shape = shape;
        this.zero_point = zero_point;
        this.scale = scale;

    }

    add(other: Matrix): Matrix {
        return add(this, other)
    }

}

function add(matrix1: Matrix, matrix2: Matrix): Matrix {

    constr_matrix_config(matrix1, matrix2);

    matrix2.zero_point.equals(Field(0));
    matrix2.scale.equals(Field(1));

    let values: Field[] = []

    for (let i = 0; i < matrix1.values.length; i++) {
        values.push(matrix1.values[i].add(matrix2.values[i]));
    }

    return new Matrix(values, matrix1.values_len, matrix1.shape, matrix1.zero_point, matrix1.scale);

}

function constr_matrix_config(matrix: Matrix, other: Matrix) {
    matrix.values_len.equals(other.values_len);
    matrix.shape[0].equals(other.shape[0]);
    matrix.shape[1].equals(other.shape[1]);
    matrix.zero_point.equals(other.zero_point);
    matrix.scale.equals(other.scale);
}