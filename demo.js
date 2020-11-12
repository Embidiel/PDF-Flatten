const flattener = require("./index");
const fs = require("fs");

const pdffilebuffer = fs.readFileSync("./needtoflat.pdf");

flattener.flatten(pdffilebuffer).then((res) => {
  console.log(`PDF Buffer: `, res);
  fs.writeFileSync("flattened-pdf.pdf", res, (err) => {
    throw new Error(err);
  });
});
