import { Matrix } from '../src/matrix_ops.js';

import { Field, Provable, ZkProgram } from 'o1js';

const other_values = [Field(1), Field(2), Field(3), Field(4), Field(5), Field(6), Field(7), Field(8), Field(9)];
const other_values_len = Field(9);
const other_shape: [Field, Field] = [Field(3), Field(3)];


let matrix_add_circuit = ZkProgram({
    name: 'matrix-add-verify',

    methods: {
        verifyaddition: {
            privateInputs: [
                Provable.Array(Field, 9),
                Field,
                Provable.Array(Field, 2),
                Field,
                Field,
            ],

            async method(
                values: Field[],
                values_len: Field,
                shape: [Field, Field],
                zero_point: Field,
                scale: Field
            ) {
                let other_matrix = new Matrix(other_values, other_values_len, other_shape, Field(0), Field(1));
                let matrix = new Matrix(values, values_len, shape, zero_point, scale);
                matrix.add(other_matrix);
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

console.time('prove');
let proof = await matrix_add_circuit.verifyaddition(other_values, other_values_len, other_shape, Field(0), Field(1));
console.timeEnd('prove');

console.time('verify');
await matrix_add_circuit.verify(proof.proof);
console.timeEnd('verify');