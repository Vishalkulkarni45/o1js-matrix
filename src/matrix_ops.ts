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

    matrix1.values_len.equals(matrix2.values_len);
    matrix1.shape[0].equals(matrix2.shape[0]);
    matrix1.shape[1].equals(matrix2.shape[1]);

    for (let i = 0; i < matrix1.values.length; i++) {
        matrix1.values[i] = matrix1.values[i].add(matrix2.values[i]);
    }

    return matrix1

}