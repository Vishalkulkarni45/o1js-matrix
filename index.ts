import { Field, Poseidon } from 'o1js';

// Example usage of o1js
const hash = Poseidon.hash([Field(1), Field(2)]);
console.log(hash.toString());