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

});