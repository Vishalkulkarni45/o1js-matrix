import { jest } from '@jest/globals';
import { Matrix } from './matrix_ops';

import { Field } from 'o1js';

jest.useFakeTimers();

describe('Matrix non-quant operations', () => {

    it('should add two matrix correctly', async () => {

        let shape = [3, 3];

        let matrix1_values: Field[] = [];
        let matrix2_values: Field[] = [];

        let exp_out: Field[] = [];

        for (let i = 0; i < shape[0] * shape[1]; i++) {
            let val1 = Field.random();
            let val2 = Field.random();
            matrix1_values.push(val1);
            matrix2_values.push(val2);
            exp_out.push(val1.add(val2));
        }

        let matrix1 = new Matrix(matrix1_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(1));
        let matrix2 = new Matrix(matrix2_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(1));

        let out = matrix1.add(matrix2);

        expect(out.values).toEqual(exp_out);

    });

    it('should subtract two matrix correctly', async () => {

        let shape = [3, 3];

        let matrix1_values: Field[] = [];
        let matrix2_values: Field[] = [];

        let exp_out: Field[] = [];

        for (let i = 0; i < shape[0] * shape[1]; i++) {
            let val1 = Field.random();
            let val2 = Field.random();
            matrix1_values.push(val1);
            matrix2_values.push(val2);
            exp_out.push(val1.sub(val2));
        }

        let matrix1 = new Matrix(matrix1_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(1));
        let matrix2 = new Matrix(matrix2_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(1));

        let out = matrix1.sub(matrix2);

        expect(out.values).toEqual(exp_out);

    });

    it('should calculate hadamard_product of two matrix correctly', async () => {

        let shape = [3, 3];

        let matrix1_values: Field[] = [];
        let matrix2_values: Field[] = [];

        let exp_out: Field[] = [];

        for (let i = 0; i < shape[0] * shape[1]; i++) {
            let val1 = Field.random();
            let val2 = Field.random();
            matrix1_values.push(val1);
            matrix2_values.push(val2);
            exp_out.push(val1.mul(val2));
        }

        let matrix1 = new Matrix(matrix1_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(1));
        let matrix2 = new Matrix(matrix2_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(1));

        let out = matrix1.hadamard_product(matrix2);

        expect(out.values).toEqual(exp_out);

    });

    it('should multiply two matrix correctly', async () => {

        let matrix1_shape = [2, 3];
        let matrix2_shape = [3, 2];
        let matrix1_values: Field[] = [1, 2, 3, 4, 5, 6].map((x) => Field(x));
        let matrix2_values: Field[] = [7, 8, 9, 10, 11, 12].map((x) => Field(x));

        let exp_out: Field[] = [58, 64, 139, 154].map((x) => Field(x));

        let matrix1 = new Matrix(matrix1_values, [Field(matrix1_shape[0]), Field(matrix1_shape[1])], Field(0), Field(1));
        let matrix2 = new Matrix(matrix2_values, [Field(matrix2_shape[0]), Field(matrix2_shape[1])], Field(0), Field(1));

        let out = matrix1.mul(matrix2);

        expect(out.values).toEqual(exp_out);
        expect(out.shape).toEqual([Field(2), Field(2)]);
    });

    it('should  calculate scalar_mul and scalar div correctly', async () => {

        let shape = [3, 3];
        let matrix_values: Field[] = [];
        let scalar = Field(2);

        let exp_mul_out: Field[] = [];
        let exp_div_out: Field[] = [];


        let val = Field(2);
        for (let i = 0; i < shape[0] * shape[1]; i++) {

            matrix_values.push(val);
            exp_mul_out.push(val.mul(scalar));
            exp_div_out.push(val.div(scalar));
            val = val.mul(Field(2));
        }
        let matrix = new Matrix(matrix_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(1));

        let scalar_mul_out = matrix.scalar_mul(scalar);
        let scalar_div_out = matrix.scalar_div(scalar);

        expect(scalar_mul_out.values).toEqual(exp_mul_out);
        expect(scalar_div_out.values).toEqual(exp_div_out);

    });


});

describe('Matrix quant operations', () => {

    it.only('should add two quantized matrix correctly', async () => {

        let shape = [3, 3];

        let matrix1_values: Field[] = new Array(shape[0] * shape[1]).fill(Field(1));
        let matrix2_values: Field[] = new Array(shape[0] * shape[1]).fill(Field(2));

        let exp_out: Field[] = new Array(shape[0] * shape[1]).fill(Field(2));

        let matrix1 = new Matrix(matrix1_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(1));
        let matrix2 = new Matrix(matrix2_values, [Field(shape[0]), Field(shape[1])], Field(0), Field(2));

        let out = matrix1.quant_add(matrix2);

        expect(out.values).toEqual(exp_out);

    });


});