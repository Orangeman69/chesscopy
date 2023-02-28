let board = document.querySelector("#chessboard");
let piecesElement = document.querySelector("#pieces");
let squareSize = board.clientWidth / 8;
let followingCursorPiece = null;
let hoverSquare = document.querySelector("#hoverSquare");
let possibleStepsElement = document.querySelector("#possibleSteps");

let mouseBoardCoords = [0, 0];
let mouseBoardSquareCoords = [0, 0];

let knockedOutBlacks = [];
let knockedOutWhites = [];

let isRotated = false;

//#plagarism
function ArrayEquals(arr1, array) {
  return (
    arr1.length == array.length &&
    arr1.every(function (this_i, i) {
      return this_i === array[i];
    })
  );
}

function ArrayDeepIncludes(arr1, array) {
  for (let index = 0; index < arr1.length; index++) {
    const element = arr1[index];
    if (ArrayEquals(element, array)) return true;
  }
  return false;
}

function getBoardSquareFromCoords(coords) {
  return [
    Math.min(
      7,
      Math.max(0, Math.round((coords[0] - squareSize / 2) / squareSize))
    ),
    Math.min(
      7,
      Math.max(0, Math.round((coords[1] - squareSize / 2) / squareSize))
    ),
  ];
}

function getCoordsRotated(coords) {
  return isRotated ? [7 - coords[0], 7 - coords[1]] : coords;
}

function getPieceAt(coords) {
  let filtered = pieces.filter((p) => ArrayEquals(p.position, coords));
  if (filtered.length === 1) return filtered[0];
  else return null;
}

function isFreeSquare(coords) {
  return getPieceAt(coords) === null;
}

function isEnemyAt(coords, color) {
  return getPieceAt(coords) ? getPieceAt(coords).color !== color : false;
}

function isFriendlyAt(coords, color) {
  return getPieceAt(coords) ? getPieceAt(coords).color === color : false;
}

function isInBounds(coords) {
  return coords[0] >= 0 && coords[0] < 8 && coords[1] >= 0 && coords[1] < 8;
}

function setMouseBoardCoords(e) {
  let rect = board.getBoundingClientRect();
  let x = e.clientX - rect.left;
  let y = e.clientY - rect.top;
  console.log(x, y);
  mouseBoardCoords = [x, y];
  mouseBoardSquareCoords = getCoordsRotated(getBoardSquareFromCoords([x, y]));
}

function followCursor() {
  followingCursorPiece.htmlElement.style.left = `${
    mouseBoardCoords[0] - squareSize / 2
  }px`;
  followingCursorPiece.htmlElement.style.top = `${
    mouseBoardCoords[1] - squareSize / 2
  }px`;
}

function mouseDownOnPiece(piece) {
  piece.beforeDragPos = piece.position;
  followingCursorPiece = piece;
  followingCursorPiece.htmlElement.style.zIndex = 4;
  displayHoverSquare();
  displayPossibleSteps(piece);
}

function stopFollowingCursor() {
  if (followingCursorPiece) {
    followingCursorPiece.htmlElement.style.zIndex = 2;
  }
}

function displayHoverSquare() {
  hoverSquare.style.display = "block";
  const reRotateCoords = getCoordsRotated(mouseBoardSquareCoords);
  hoverSquare.style.left = `${reRotateCoords[0] * squareSize}px`;
  hoverSquare.style.top = `${reRotateCoords[1] * squareSize}px`;
}

function hideHoverSquare() {
  hoverSquare.style.display = "none";
}

function getCoordsFromNotation(notation) {
  let x = notation.charCodeAt(0) - 97;
  let y = 8 - notation[1];
  return [x, y];
}

function displayPossibleSteps(piece) {
  let possibleSteps = piece.getPossibleSteps();
  for (let coords of possibleSteps) {
    let step = document.createElement("div");
    let circle = document.createElement("div");
    if (isEnemyAt(coords, piece.color)) circle.classList.add("take");
    const displayCoords = getCoordsRotated(coords);
    step.style.left = displayCoords[0] * squareSize + "px";
    step.style.top = displayCoords[1] * squareSize + "px";
    step.appendChild(circle);
    possibleStepsElement.appendChild(step);
  }
}

function hidePossibleSteps() {
  possibleStepsElement.innerHTML = "";
}

function getPawnPossibleSteps({ position, forward, startingPosition, color }) {
  let possibleSteps = [];

  if (isFreeSquare([position[0], position[1] + forward]))
    possibleSteps.push([position[0], position[1] + forward]);

  if (
    ArrayEquals(position, startingPosition) &&
    isFreeSquare([position[0], position[1] + forward])
  )
    possibleSteps.push([position[0], position[1] + forward * 2]);

  if (isEnemyAt([position[0] + forward, position[1] + forward], color))
    possibleSteps.push([position[0] + forward, position[1] + forward]);

  if (isEnemyAt([position[0] - forward, position[1] + forward], color))
    possibleSteps.push([position[0] - forward, position[1] + forward]);

  possibleSteps = possibleSteps.filter((s) => isInBounds(s));

  return possibleSteps;
}

function getKnightPossibleSteps({ position, forward, color }) {
  let possibleSteps = [];
  possibleSteps.push([position[0] + forward, position[1] + forward * 2]);
  possibleSteps.push([position[0] - forward, position[1] + forward * 2]);
  possibleSteps.push([position[0] + forward * 2, position[1] + forward]);
  possibleSteps.push([position[0] - forward * 2, position[1] + forward]);

  possibleSteps.push([position[0] + forward, position[1] - forward * 2]);
  possibleSteps.push([position[0] - forward, position[1] - forward * 2]);
  possibleSteps.push([position[0] + forward * 2, position[1] - forward]);
  possibleSteps.push([position[0] - forward * 2, position[1] - forward]);

  possibleSteps = possibleSteps.filter(
    (s) => isInBounds(s) && !isFriendlyAt(s, color)
  );
  return possibleSteps;
}

function getRookPossibleSteps({ position, forward, color }) {
  let possibleSteps = [];
  let step = [];
  for (let index = 1; index < 8; index++) {
    step = [position[0], position[1] + forward * index];
    if (isFreeSquare(step)) possibleSteps.push(step);
    else break;
  }
  if (isEnemyAt(step, color)) possibleSteps.push(step);

  step = [];
  for (let index = 1; index < 8; index++) {
    step = [position[0], position[1] - forward * index];
    if (isFreeSquare(step)) possibleSteps.push(step);
    else break;
  }
  if (isEnemyAt(step, color)) possibleSteps.push(step);

  step = [];
  for (let index = 1; index < 8; index++) {
    step = [position[0] + forward * index, position[1]];
    if (isFreeSquare(step)) possibleSteps.push(step);
    else break;
  }
  if (isEnemyAt(step, color)) possibleSteps.push(step);
  step = [];

  for (let index = 1; index < 8; index++) {
    step = [position[0] - forward * index, position[1]];
    if (isFreeSquare(step)) possibleSteps.push(step);
    else break;
  }
  if (isEnemyAt(step, color)) possibleSteps.push(step);

  possibleSteps = possibleSteps.filter((s) => isInBounds(s));
  return possibleSteps;
}

function getBishopPossibleSteps({ position, forward, color }) {
  let possibleSteps = [];
  let step = [];
  for (let index = 1; index < 8; index++) {
    step = [position[0] + forward * index, position[1] + forward * index];
    if (isFreeSquare(step)) possibleSteps.push(step);
    else break;
  }
  if (isEnemyAt(step, color)) possibleSteps.push(step);

  step = [];
  for (let index = 1; index < 8; index++) {
    step = [position[0] - forward * index, position[1] - forward * index];
    if (isFreeSquare(step)) possibleSteps.push(step);
    else break;
  }
  if (isEnemyAt(step, color)) possibleSteps.push(step);

  step = [];
  for (let index = 1; index < 8; index++) {
    step = [position[0] + forward * index, position[1] - forward * index];
    if (isFreeSquare(step)) possibleSteps.push(step);
    else break;
  }
  if (isEnemyAt(step, color)) possibleSteps.push(step);
  step = [];

  for (let index = 1; index < 8; index++) {
    step = [position[0] - forward * index, position[1] + forward * index];
    if (isFreeSquare(step)) possibleSteps.push(step);
    else break;
  }
  if (isEnemyAt(step, color)) possibleSteps.push(step);

  possibleSteps = possibleSteps.filter((s) => isInBounds(s));
  return possibleSteps;
}

function getKingPossibleSteps(piece) {
  const { position, forward, color } = piece;

  let possibleSteps = [];
  possibleSteps.push([position[0] + forward, position[1] + forward]);
  possibleSteps.push([position[0] - forward, position[1] - forward]);
  possibleSteps.push([position[0] + forward, position[1] - forward]);
  possibleSteps.push([position[0] - forward, position[1] + forward]);
  possibleSteps.push([position[0], position[1] + forward]);
  possibleSteps.push([position[0], position[1] - forward]);
  possibleSteps.push([position[0] + forward, position[1]]);
  possibleSteps.push([position[0] - forward, position[1]]);
  //0-0-0
  if (piece.canCastleLong()) {
    possibleSteps.push(piece.castleLongCoords);
  }
  //0-0
  if (piece.canCastleShort()) {
    possibleSteps.push(piece.castleShortCoords);
  }
  possibleSteps = possibleSteps.filter(
    (s) => isInBounds(s) && !isFriendlyAt(s, color)
  );
  return possibleSteps;
}

class Piece {
  constructor(type, color, startingPositionNOTATION) {
    this.id = `${color}${startingPositionNOTATION[0]}${
      type[0] === "kn" ? "N" : type[0].toUpperCase()
    }`;
    this.type = type;
    this.color = color;
    this.forward = color === "w" ? -1 : 1;
    this.position = getCoordsFromNotation(startingPositionNOTATION);
    this.startingPosition = this.position;
    this.canBeEnPassanted = false;
    this.moved = false;
    this.castleShortCoords =
      this.type === "king"
        ? [this.startingPosition[0] + 2, this.startingPosition[1]]
        : [];

    this.castleLongCoords =
      this.type === "king"
        ? [this.startingPosition[0] - 2, this.startingPosition[1]]
        : [];

    this.createHtmlElement();
  }

  setHtmlPosition(position) {
    let rotatedPos = getCoordsRotated(position);
    this.htmlElement.style.left = rotatedPos[0] * squareSize + "px";
    this.htmlElement.style.top = rotatedPos[1] * squareSize + "px";
  }

  refreshPosition() {
    this.setHtmlPosition(this.position);
  }

  createHtmlElement() {
    let piece = document.createElement("div");
    piece.classList.add("piece");
    piece.id = this.id;
    piece.classList.add(
      `${this.color}${
        this.type.startsWith("kn") ? "N" : this.type[0].toUpperCase()
      }`
    );
    piece.addEventListener("mousedown", (e) => {
      mouseDownOnPiece(this);
    });
    piece.ondragstart = () => {
      return false;
    };
    piecesElement.appendChild(piece);
    this.htmlElement = piece;
  }
  toStartingPosition() {
    this.setHtmlPosition(this.position);
  }

  move(coords, byPassCheck = false) {
    if (byPassCheck || ArrayDeepIncludes(this.getPossibleSteps(), coords)) {
      this.moved = true;
      this.position = coords;
      this.setHtmlPosition(coords);
      this.beforeDragPos = coords;
    }
  }

  take(enemyPiece) {
    if (this.color === "w") knockedOutBlacks.push(enemyPiece);
    else knockedOutWhites.push(enemyPiece);

    this.move(enemyPiece.position);
    pieces = pieces.filter((p) => p !== enemyPiece);
    enemyPiece.htmlElement.style.display = "none";
  }

  castle(short = false) {
    if (short) {
      let hRook = pieces.filter((p) => p.id === this.color + "hR");
      if (hRook.length === 1) hRook = hRook[0];
      else return;
      this.move(this.castleShortCoords, true);
      hRook.move(
        [this.castleShortCoords[0] - 1, this.castleShortCoords[1]],
        true
      );
      return;
    }

    let aRook = pieces.filter((p) => p.id === this.color + "aR");
    if (aRook.length === 1) aRook = aRook[0];
    else return;
    this.move(this.castleLongCoords, true);
    aRook.move([this.castleLongCoords[0] + 1, this.castleLongCoords[1]], true);
  }

  canCastleLong() {
    const { position, color, type, moved } = this;
    if (type !== "king" || moved) return false;
    let aRook = pieces.filter((p) => p.id === color + "aR");
    if (aRook) aRook = aRook[0];
    return (
      aRook &&
      !moved &&
      !aRook.moved &&
      isFreeSquare([position[0] - 1, position[1]]) &&
      isFreeSquare([position[0] - 2, position[1]]) &&
      isFreeSquare([position[0] - 3, position[1]])
    );
  }

  canCastleShort() {
    const { position, color, type, moved } = this;
    if (type !== "king" || moved) return false;
    let hRook = pieces.filter((p) => p.id === color + "hR");
    if (hRook) hRook = hRook[0];
    return (
      hRook &&
      !moved &&
      !hRook.moved &&
      isFreeSquare([position[0] + 1, position[1]]) &&
      isFreeSquare([position[0] + 2, position[1]])
    );
  }

  getPossibleSteps() {
    let possibleSteps = [];
    switch (this.type) {
      case "pawn":
        return getPawnPossibleSteps(this);
      case "knight":
        return getKnightPossibleSteps(this);
      case "rook":
        return getRookPossibleSteps(this);
      case "bishop":
        return getBishopPossibleSteps(this);
      case "queen":
        return [...getBishopPossibleSteps(this), ...getRookPossibleSteps(this)];
      case "king":
        return getKingPossibleSteps(this);
    }
    return possibleSteps;
  }
}

function getDefaultPieces() {
  let pieces = [
    new Piece("king", "w", "e1"),
    new Piece("queen", "w", "d1"),
    new Piece("bishop", "w", "c1"),
    new Piece("bishop", "w", "f1"),
    new Piece("knight", "w", "b1"),
    new Piece("knight", "w", "g1"),
    new Piece("rook", "w", "a1"),
    new Piece("rook", "w", "h1"),
    new Piece("king", "b", "e8"),
    new Piece("queen", "b", "d8"),
    new Piece("bishop", "b", "c8"),
    new Piece("bishop", "b", "f8"),
    new Piece("knight", "b", "b8"),
    new Piece("knight", "b", "g8"),
    new Piece("rook", "b", "a8"),
    new Piece("rook", "b", "h8"),
  ];
  for (let i = 0; i < 8; i++) {
    pieces.push(new Piece("pawn", "w", `${String.fromCharCode(97 + i)}2`));
    pieces.push(new Piece("pawn", "b", `${String.fromCharCode(97 + i)}7`));
  }
  return pieces;
}

let pieces = getDefaultPieces();

for (let piece of pieces) {
  piece.toStartingPosition();
}

window.addEventListener("resize", () => {
  squareSize = board.clientWidth / 8;
  for (let piece of pieces) {
    piece.refreshPosition();
  }
});

board.addEventListener("mousemove", (e) => {
  setMouseBoardCoords(e);
  if (followingCursorPiece) {
    displayHoverSquare();
    followCursor();
  }
});

window.addEventListener("mouseup", (e) => {
  if (followingCursorPiece) {
    stopFollowingCursor();
    hidePossibleSteps();
    hideHoverSquare();
    if (
      ArrayDeepIncludes(
        followingCursorPiece.getPossibleSteps(),
        mouseBoardSquareCoords
      )
    ) {
      if (isEnemyAt(mouseBoardSquareCoords, followingCursorPiece.color)) {
        followingCursorPiece.take(getPieceAt(mouseBoardSquareCoords));
        followingCursorPiece = null;
        return;
      }
      if (
        followingCursorPiece.canCastleLong() &&
        ArrayEquals(
          followingCursorPiece.castleLongCoords,
          mouseBoardSquareCoords
        )
      ) {
        followingCursorPiece.castle();
        followingCursorPiece = null;
        return;
      }

      if (
        followingCursorPiece.canCastleShort() &&
        ArrayEquals(
          followingCursorPiece.castleShortCoords,
          mouseBoardSquareCoords
        )
      ) {
        followingCursorPiece.castle(true);
        followingCursorPiece = null;
        return;
      }

      followingCursorPiece.move(mouseBoardSquareCoords);
    } else {
      followingCursorPiece.setHtmlPosition(followingCursorPiece.beforeDragPos);
    }

    followingCursorPiece = null;
  }
});

function rotateBoard() {
  isRotated = !isRotated;
  if (isRotated) {
    document.querySelector("#Vcoordinates").classList.add("rotated");
    document.querySelector("#Hcoordinates").classList.add("rotated");
  } else {
    document.querySelector("#Vcoordinates").classList.remove("rotated");
    document.querySelector("#Hcoordinates").classList.remove("rotated");
  }
  for (p of pieces) {
    p.refreshPosition();
  }
}
