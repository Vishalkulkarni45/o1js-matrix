import { Matrix } from './matrix_ops.js';

import { Field, Provable, ZkProgram } from 'o1js';

const other_values = [0, 1, 2, 4, 5, 6, 7, 8, 0].map((x) => Field(x));
const other_shape: [Field, Field] = [Field(3), Field(3)];


let matrix_add_circuit = ZkProgram({
    name: 'matrix-add-verify',

    methods: {
        verifyaddition: {
            privateInputs: [
                Provable.Array(Field, 9),
                Provable.Array(Field, 2),
                Field,
                Field,
            ],

            async method(
                values: Field[],
                shape: Field[],
                zero_point: Field,
                scale: Field
            ) {
                let other_matrix = new Matrix(other_values, other_shape, Field(0), Field(1));
                let matrix = new Matrix(values, other_shape, zero_point, scale);
                let out_add = matrix.add(other_matrix);
                let out_sub = matrix.sub(other_matrix);
                let out_hadamard = matrix.hadamard_product(other_matrix);
                let out_mul = matrix.mul(other_matrix);
                let inv_mat = other_matrix.inverse();
                let I = inv_mat.mul(other_matrix);
            },
        },
    },
});

let { verifyaddition } = await matrix_add_circuit.analyzeMethods();

console.log(verifyaddition.summary());

console.time('compile');
const forceRecompileEnabled = false;
await matrix_add_circuit.compile({ forceRecompile: forceRecompileEnabled });
console.timeEnd('compile');

const cur_values = [Field(1), Field(2), Field(3), Field(4), Field(5), Field(6), Field(7), Field(8), Field(9)];
const cur_shape = [Field(3), Field(3)];


console.time('prove');
let proof = await matrix_add_circuit.verifyaddition(cur_values, cur_shape, Field(0), Field(1));
console.timeEnd('prove');

console.time('verify');
await matrix_add_circuit.verify(proof.proof);
console.timeEnd('verify');