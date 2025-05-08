export const getTaxRateValue = (taxRateCode: string): number => {
  let result = 0;
  switch (taxRateCode) {
    case '02':
      result = 1;
      break;
    case '03':
      result = 2;
      break;
    case '04':
      result = 4;
      break;
    case '05':
      result = 0;
      break;
    case '06':
      result = 4;
      break;
    case '07':
      result = 8;
      break;
    case '08':
      result = 13;
      break;
    case '09':
      result = 0.5;
      break;
    case '10':
      result = 0;
      break;

    default:
      break;
  }

  return result;
};
