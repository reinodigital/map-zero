// Define a custom table layout
export const rowDividerLayout = {
  hLineWidth: function (i, node) {
    // Draw a horizontal line if 'i' is greater than 0 (i.e., after the first row/header)
    // and if 'i' is less than the total number of rows (to avoid a line at the very bottom edge of the table)
    // This will draw a line *before* each row starting from the second row,
    // which effectively means a line *after* each row except the last one.
    if (i > 0 && i < node.table.body.length) {
      return 1; // 1-pixel line width
    }
    return 0; // No line
  },
  vLineWidth: function (i, node) {
    return 0; // No vertical lines
  },
  hLineColor: function (i, node) {
    return '#aaa'; // Light gray line color
  },
  vLineColor: function (i, node) {
    return '#aaa'; // (Not used, but good practice to include)
  },
  // You might also want to adjust padding for cells if the default feels off without borders
  // paddingTop: function(i, node) { return 5; },
  // paddingBottom: function(i, node) { return 5; },
  // paddingLeft: function(i, node) { return 5; },
  // paddingRight: function(i, node) { return 5; },
};
