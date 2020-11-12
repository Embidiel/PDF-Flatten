const fs = require("fs");
const PDFToIMG = require("./pdf-to-img");
const rimraf = require("rimraf");
const { PDFDocument } = require("pdf-lib");

const isDirExists = (path) => {
  try {
    return fs.statSync(path).isDirectory();
  } catch (e) {
    return false;
  }
};

const imagesToPDF = async (paths, dirPath) => {
  if (!Array.isArray(paths) || paths.length === 0) {
    throw new Error("Must have at least one path in array");
  }

  try {
    const pdfDoc = await PDFDocument.create();

    for (const path of paths) {
      const imgfile = fs.readFileSync(path);

      const jpgImage = await pdfDoc.embedJpg(imgfile);
      const { width, height } = jpgImage.size();

      const page = pdfDoc.addPage();
      const resizedwidth = width - page.getWidth();
      const resizedheight = height - page.getHeight();

      page.drawImage(jpgImage, {
        x: 0,
        y: 0,
        width: resizedwidth,
        height: resizedheight,
      });
    }

    const pdfBytes = await pdfDoc.save();
    rimraf.sync(dirPath);

    return pdfBytes;
  } catch (err) {
    console.log(err);
    throw new Error("Error in converting images to pdf file.");
  }
};

const Flattener = function () {};

Flattener.prototype.flatten = async function (buffer, options = {}) {
  let path = options.path || __dirname;
  // Make the path relatively unique to better support concurrent processing
  const timestamp =
    Date.now() +
    Math.random().toString(36).substring(2, 6) +
    Math.random().toString(36).substring(2, 6);
  path = path + "/" + timestamp;

  if (!isDirExists(path)) {
    fs.mkdirSync(path);
  }
  if (!isDirExists(path + "/docs")) {
    fs.mkdirSync(path + "/docs");
  }

  const pdftoimg = new PDFToIMG();

  pdftoimg.setOptions({
    type: options.type || "jpg", // JPG, PNG
    density: options.density || 200,
    outputdir: path + "/split",
    outputname: "split",
    page: null,
  });

  fs.writeFileSync(path + "/docs/originalFile.pdf", buffer, (err) => {
    if (err) console.log(err);
  });

  console.log('pathito', path);

  return pdftoimg
    .convert(path + "/docs/originalFile.pdf")
    .then((res) => {
      const splitFiles = fs
        .readdirSync(path + "/split", (err) => console.log(err))
        .map((images) => path + "/split/" + images)
        .sort(function (a, b) {
          return (
            fs.statSync(a).mtime.getTime() - fs.statSync(b).mtime.getTime()
          );
        });
      const buffer = imagesToPDF(splitFiles, path);
      return buffer;
    })
    .catch((err) => console.log("error: ", err));
};

module.exports = new Flattener();
