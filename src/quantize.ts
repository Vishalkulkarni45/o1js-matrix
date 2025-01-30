import { Field, Gadgets, Provable } from "o1js";

// quantized arithmetic mul
// ((x_quantized - x_zero_point) / x_scale_reciprocal) * ((y_quantized - y_zero_point) / y_scale_reciprocal) * z_scale_reciprocal + z_zero_point;
function mul_quant(x_quantized: Field, x_zero_point: Field, x_scale_reciprocal: Field, y_quantized: Field, y_zero_point: Field, y_scale_reciprocal: Field, z_zero_point: Field, z_scale_reciprocal: Field): Field {
    let z_quantized = Field(1).div((x_scale_reciprocal.mul(y_scale_reciprocal)).div(z_scale_reciprocal)).mul(x_quantized.sub(x_zero_point)).mul(y_quantized.sub(y_zero_point)).add(z_zero_point);
    return z_quantized;
}

// quantized arithmetic div
// ((x_quantized - x_zero_point) / x_scale_reciprocal) / ((y_quantized - y_zero_point) / y_scale_reciprocal) * z_scale_reciprocal + z_zero_point;
function div_quant(x_quantized: Field, x_zero_point: Field, x_scale_reciprocal: Field, y_quantized: Field, y_zero_point: Field, y_scale_reciprocal: Field, z_zero_point: Field, z_scale_reciprocal: Field): Field {
    let z_quantized = Field(1).div((x_scale_reciprocal.div(y_scale_reciprocal)).div(z_scale_reciprocal)).mul(x_quantized.sub(x_zero_point)).div(y_quantized.sub(y_zero_point)).add(z_zero_point);
    return z_quantized;
}

// quantized arithmetic add
// ((x_quantized - x_zero_point) / x_scale_reciprocal) + ((y_quantized - y_zero_point) / y_scale_reciprocal) * z_scale_reciprocal + z_zero_point;
function add_quant(x_quantized: Field, x_zero_point: Field, x_scale_reciprocal: Field, y_quantized: Field, y_zero_point: Field, y_scale_reciprocal: Field, z_zero_point: Field, z_scale_reciprocal: Field): Field {

    let multiplier_x_y = Field(0);
    let x_scale_100 = x_scale_reciprocal.mul(Field(100));
    let y_scale_100 = y_scale_reciprocal.mul(Field(100));

    Gadgets.rangeCheck8(x_scale_100);
    Gadgets.rangeCheck8(y_scale_100);

    let is_x_scale_gr = x_scale_100.greaterThan(y_scale_100);

    if (is_x_scale_gr) {
        multiplier_x_y = y_scale_reciprocal.mul(Field(2));
    } else {
        multiplier_x_y = x_scale_reciprocal.mul(Field(2));
    }

    let multiplier_x = (Field(1).div(x_scale_reciprocal)).div(multiplier_x_y);
    let multiplier_y = (Field(1).div(y_scale_reciprocal)).div(multiplier_x_y);
    let multiplier_x_y_z = multiplier_x_y.mul(z_scale_reciprocal);
    let z_quantized = multiplier_x_y_z.mul(multiplier_x.mul(x_quantized.sub(x_zero_point)).add(multiplier_y.mul(y_quantized.sub(y_zero_point)))).add(z_zero_point);

    return z_quantized
}

// quantized arithmetic sub
// ((x_quantized - x_zero_point) / x_scale_reciprocal) - ((y_quantized - y_zero_point) / y_scale_reciprocal) * z_scale_reciprocal + z_zero_point;
function sub_quant(x_quantized: Field, x_zero_point: Field, x_scale_reciprocal: Field, y_quantized: Field, y_zero_point: Field, y_scale_reciprocal: Field, z_zero_point: Field, z_scale_reciprocal: Field): Field {
    let multiplier_x_y = Field(0);
    let x_scale_100 = x_scale_reciprocal.mul(Field(100));
    let y_scale_100 = y_scale_reciprocal.mul(Field(100));

    Gadgets.rangeCheck8(x_scale_100);
    Gadgets.rangeCheck8(y_scale_100);

    let is_x_scale_gr = x_scale_100.greaterThan(y_scale_100);
    if (is_x_scale_gr) {
        multiplier_x_y = y_scale_reciprocal.mul(Field(2));
    } else {
        multiplier_x_y = x_scale_reciprocal.mul(Field(2));
    }

    let multiplier_x = (Field(1).div(x_scale_reciprocal)).div(multiplier_x_y);
    let multiplier_y = (Field(1).div(y_scale_reciprocal)).div(multiplier_x_y);
    let multiplier_x_y_z = multiplier_x_y.mul(z_scale_reciprocal);

    let z_quantized = multiplier_x_y_z.mul(multiplier_x.mul(x_quantized.sub(x_zero_point)).sub(multiplier_y.mul(y_quantized.sub(y_zero_point)))).add(z_zero_point);

    return z_quantized
}
