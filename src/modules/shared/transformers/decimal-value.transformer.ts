// src/common/transformers/decimal-transformer.ts
import { ValueTransformer } from 'typeorm';

export class DecimalTransformer implements ValueTransformer {
  to(value: number | null | undefined): string | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }

    // Convert the number to a string to avoid floating point math issues during truncation
    const strValue = String(value);

    // Find the position of the decimal point
    const decimalIndex = strValue.indexOf('.');

    if (decimalIndex === -1) {
      // No decimal point, add .00
      return `${strValue}.00`;
    }

    // Extract the part before the decimal
    const integerPart = strValue.substring(0, decimalIndex);
    // Extract the part after the decimal
    let decimalPart = strValue.substring(decimalIndex + 1);

    // If decimal part is less than 2 digits, pad with zeros
    if (decimalPart.length < 2) {
      decimalPart = decimalPart.padEnd(2, '0');
    } else {
      // Truncate to exactly two digits
      decimalPart = decimalPart.substring(0, 2);
    }

    return `${integerPart}.${decimalPart}`;
  }

  from(value: string | null | undefined): number | null | undefined {
    if (value === null || value === undefined) {
      return value;
    }
    // Parse the string from the database back to a float.
    // It should already be correctly formatted with 2 decimals from the 'to' method
    return parseFloat(value);
  }
}
