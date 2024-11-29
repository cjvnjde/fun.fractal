const canvasEl = document.createElement("canvas");
const context2D = canvasEl.getContext("2d");
const ctx = context2D;

let scale = 1;
const angle = 90;
let width = 600;
let height = 480;
canvasEl.id = "canvas";
canvasEl.width = width;
canvasEl.height = height;

document.body.append(canvasEl);

const rect = canvasEl.getBoundingClientRect();

const paths = [];

function drawPaths() {
  context2D.clearRect(0, 0, width * scale, height * scale);

  paths.forEach((path) => {
    context2D.beginPath();

    if (paths.length > 0) {
      fitPathToCanvas(path).forEach((coord, index) => {
        if (index === 0) {
          context2D.moveTo(coord.x, coord.y);
        } else {
          context2D.lineTo(coord.x, coord.y);
        }
      });

      context2D.stroke();
    }
  });
}

function rotatePath(path, angle) {
  const pivot = path[0];
  const radians = (Math.PI / 180) * angle;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return path.map((point) => {
    const translatedX = point.x - pivot.x;
    const translatedY = point.y - pivot.y;

    const rotatedX = translatedX * cos - translatedY * sin;
    const rotatedY = translatedX * sin + translatedY * cos;

    return {
      x: rotatedX + pivot.x,
      y: rotatedY + pivot.y,
    };
  });
}

function movePath(path, target) {
  const pivot = path[0];
  const offsetX = target.x - pivot.x;
  const offsetY = target.y - pivot.y;

  // Finally, move the rotated path to the target
  return path.map((point) => ({
    x: point.x + offsetX,
    y: point.y + offsetY,
  }));
}

function fitPathToCanvas(path) {
  let minX = Infinity,
    minY = Infinity;
  let maxX = -Infinity,
    maxY = -Infinity;

  for (const point of path) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  const pathWidth = maxX - minX;
  const pathHeight = maxY - minY;

  if (minX >= 0 && minY >= 0 && maxX <= width && maxY <= height) {
    return path; // No need to scale
  }

  const scaleX = width / pathWidth;
  const scaleY = height / pathHeight;

  const scale = Math.min(scaleX, scaleY);

  const offsetX = (width - pathWidth * scale) / 2;
  const offsetY = (height - pathHeight * scale) / 2;

  const scaledPath = path.map((point) => ({
    x: (point.x - minX) * scale + offsetX,
    y: (point.y - minY) * scale + offsetY,
  }));

  return scaledPath;
}

function drawOnCanvas() {
  let isDrawing = false;

  const startDrawing = () => {
    isDrawing = true;
    paths.push([]);
  };

  const stopDrawing = () => {
    isDrawing = false;

    setInterval(() => {
      const rotatedPath = rotatePath(paths[0], angle);
      const movedPath = movePath(rotatedPath, paths[0][paths[0].length - 1]);
      paths[0].push(...movedPath);

      drawPaths();
    }, 500);
  };

  const draw = (e) => {
    const currentCaardinates = {
      x: e.x,
      y: e.y,
    };

    paths[paths.length - 1]?.push(currentCaardinates);

    drawPaths();
  };

  canvasEl.addEventListener("mousedown", startDrawing);
  canvasEl.addEventListener("mouseup", stopDrawing);

  canvasEl.addEventListener("mousemove", (e) => {
    if (isDrawing) {
      draw(e);
    }
  });
}

drawOnCanvas();
