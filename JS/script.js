//SVG要素の取得
const SVGRouletteBase = document.getElementById("svgRouletteBase");
const SVGRouletteTri = document.getElementById("svgRouletteTri");
const SVGRouletteBoard = document.getElementById("svgRouletteBoard");
const SVGRouletteCircle = document.getElementById("svgRouletteCircle");
//暗転用空要素の取得
const BlackoutCover = document.getElementById("blackoutCover");

const HiddenPage = document.getElementById("hiddenPage"); //div要素

//結果表示用要素の取得
const ResultTexts = document.getElementById("resultTexts"); //div要素
const ResultText1 = document.getElementById("resultText1");
const ResultText2 = document.getElementById("resultText2");
const ResultText3 = document.getElementById("resultText3");
const HiddenBtnResult = document.getElementById("hiddenBtnResult"); //div要素
const AgainBtn = document.getElementById("againBtn");
const ReturnBtn = document.getElementById("returnBtn");

//ulリスト要素の取得
const UlTodoList = document.getElementById("ulTodoList");
//回すボタンの取得
const RouletteBtn = document.getElementById("rouletteBtn");
//増やすボタンの取得
const AddListBtn = document.getElementById("addListBtn");
//止めるボタンの取得
const HiddenBtnStp = document.getElementById("hiddenBtnStp"); //div要素
const StopBtn = document.getElementById("stopBtn");

//隠し要素を配列にまとめておく
const hiddenElements = [HiddenPage, SVGRouletteBase, StopBtn, BlackoutCover];
const hiddenElements2 = [
  ResultTexts,
  ResultText1,
  ResultText2,
  ResultText3,
  AgainBtn,
  ReturnBtn,
];

//DOM読み込み後に実行
document.addEventListener("DOMContentLoaded", function () {
  //テキストボックスを生成する関数を五回実行する(初期表示時のもの　数値は自由にメンテOK)
  for (let i = 0; i <= 4; i++) {
    createTxtBox();
  }
});

//回すボタンクリック
RouletteBtn.addEventListener("click", () => {
  //テキストボックス内の「Todo」を配列内へ格納し、回収する
  //
  var todoTxtAry = []; //テキストボックス値格納用の配列
  var todoBoxes = document.getElementsByClassName("todoBox"); //テキストボックスたちを取得
  for (let i = 0; i < todoBoxes.length; i++) {
    let todoStr = todoBoxes[i].value.trim();
    if (todoStr !== "" && todoStr !== null) {
      todoTxtAry.push(todoStr); //テキストボックス内が空でない場合、値を配列に格納する
    }
  }
  if (todoTxtAry.length < 1) return; //値が何も取得されなかった場合関数を抜ける
  todoTxtAry.forEach((txt) => console.log(txt));

  //配列に格納した値をもとにルーレット盤を生成する
  //
  //元の画面を暗転させ、隠し要素を表示させる
  hiddenElements.forEach((element) => {
    showElement(element);
  });
  //配列の長さを取得して、円盤を何分割するか、そしてその際の角度を算出する
  var sectDeg = Number(360 / todoTxtAry.length);
  //配色用パレットを作成する
  var colorCodes = [];
  makeColorPallete(colorCodes, todoTxtAry.length);
  //扇形を項目数分生成する
  var board = SVGRouletteBoard;
  for (let i = 0; i < todoTxtAry.length; i++) {
    var group = document.createElementNS("http://www.w3.org/2000/svg", "g"); //領域をまとめるgタグを生成する
    group.setAttribute("id", `group${i}`); //gタグにIDを付与する
    board.appendChild(group); //タグ追加

    createRouletteSector(sectDeg, i, group, colorCodes); //領域生成
    createText(group, sectDeg, i, todoTxtAry[i]); //Todoの項目を載せる
    createOutline(group, i); //文字のはみだしを隠すために上から扇形領域の枠線を重ねる
  }
  //gタグでまとめた要素ごと回転アニメを行わせる
  SpinWheel(board);
});

//文字のはみだしを隠すために上から扇形領域の枠線を重ねる
function createOutline(group, count) {
  let outline = document.createElementNS("http://www.w3.org/2000/svg", "path");
  let sectPath = document.getElementById(`Path${count}`);
  outline.setAttribute("d", sectPath.getAttribute("d"));
  outline.setAttribute("stroke", "white");
  outline.setAttribute("stroke-width", "1");
  outline.setAttribute("fill", "none");
  outline.setAttribute("id", `outline${count}`);
  group.appendChild(outline);
}

//ルーレットの扇形領域を生成する
function createRouletteSector(deg, count, group, palette) {
  var newSect = document.createElementNS("http://www.w3.org/2000/svg", "path");

  //盤の中心座標や半径といった情報を取得
  var circle = SVGRouletteCircle;
  var cx = Number(circle.getAttribute("cx"));
  var cy = Number(circle.getAttribute("cy"));
  var r = Number(circle.getAttribute("r"));
  //角度計算に必要な値を算出
  var startDeg = -90 + deg * count; //12時方向から描画開始させるように-90する
  var endDeg = -90 + deg * (count + 1);
  var startRad = degToRad(startDeg);
  var endRad = degToRad(endDeg);
  //三角関数で始点と終点の座標を求める
  var sx = cx + r * Math.cos(startRad);
  var sy = cy + r * Math.sin(startRad);
  var ex = cx + r * Math.cos(endRad);
  var ey = cy + r * Math.sin(endRad);

  //pathのd属性を設定する
  var largeArcFlag = deg > 180 ? 1 : 0;
  var pathStr = `M ${cx} ${cy} L ${sx} ${sy} A ${r} ${r} 0 ${largeArcFlag} 1 ${ex} ${ey} Z`; //時計周りに描画
  newSect.setAttribute("d", pathStr);

  //path要素のIDとクラスを設定する
  var pathId = `Path${count}`;
  newSect.setAttribute("id", pathId);
  newSect.setAttribute("class", "sector");

  //扇型領域の色を決定する
  //newSect.setAttribute("stroke", "white");
  //newSect.setAttribute("stroke-width", "1.5");
  newSect.setAttribute("stroke", "none");
  sectColor(newSect, palette, count);

  //扇型領域を領域グループタグに追加する
  group.appendChild(newSect);
}

//度をラジアンへと変換する（主に三角関数の引数用）
function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

//扇形領域の色を決める
function sectColor(newSect, palette, count) {
  newSect.style.fill = palette[count];
}

//項目数に応じて配色用パレットの中身を決定する
function makeColorPallete(emptyColorCodeAry, todoLength) {
  var paletteA = [
    "#E9546B",
    "#F6AD3C",
    "#FFF33F",
    "#AACF52",
    "#00AFEC",
    "#187FC4",
    "#A64A97",
  ]; //基本の七色
  var paletteB = ["#EA5532", "#00ADA9", "#E85298"]; //追加用の色
  if (todoLength <= 7) {
    emptyColorCodeAry.push(...paletteA.slice(0, todoLength));
  } else if (todoLength == 8) {
    emptyColorCodeAry.push(...paletteA.slice(0, 7));
    emptyColorCodeAry.unshift(paletteB[0]);
  } else if (todoLength == 9) {
    emptyColorCodeAry.push(...paletteA.slice(0, 7));
    emptyColorCodeAry.unshift(paletteB[0]);
    emptyColorCodeAry.splice(5, 0, paletteB[1]);
  } else if (todoLength == 10) {
    emptyColorCodeAry.push(...paletteA.slice(0, 7));
    emptyColorCodeAry.unshift(paletteB[0]);
    emptyColorCodeAry.splice(5, 0, paletteB[1]);
    emptyColorCodeAry.push(paletteB[2]);
  }
}

function createText(group, deg, count, todoStr) {
  //座標設定
  //
  //盤の中心座標や半径といった情報を取得
  var circle = SVGRouletteCircle;
  var cx = Number(circle.getAttribute("cx"));
  var cy = Number(circle.getAttribute("cy"));
  var r = Number(circle.getAttribute("r"));
  //角度計算に必要な値を算出
  r = r * 0.93; //文字の開始地点が円周より内側になるようにする
  var startDeg = -90 + deg * (count + 0.5); //各領域の円弧の中点から文字が始まるようにする
  var startRad = degToRad(startDeg);
  //三角関数で始点の座標を求める
  var sx = cx + r * Math.cos(startRad);
  var sy = cy + r * Math.sin(startRad);

  //path要素とtextPath要素を紐づけるIDを生成する
  var pathId = `textPath${count}`;

  //path要素を作成する
  var newPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
  //パスにIDをセットする
  newPath.setAttribute("id", pathId);
  // 円周上の点から中心への直線としてパスを設定する
  newPath.setAttribute("d", `M ${sx} ${sy} L ${cx} ${cy}`);
  // 盤に追加する
  group.appendChild(newPath);

  //パスに沿わせるための textPath要素を作る
  var newTextPath = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "textPath",
  );

  // テキスト内容をtextPath要素に入れる
  newTextPath.textContent = todoStr;
  //Path要素のIDを紐付ける
  newTextPath.setAttribute("href", `#${pathId}`);

  //text要素を生成する
  var newText = document.createElementNS("http://www.w3.org/2000/svg", "text");

  //縦書き指定にする
  newText.setAttribute("writing-mode", "vertical-rl");
  //text要素の中にtextPath要素を追加し、盤に追加する
  newText.appendChild(newTextPath);
  group.appendChild(newText);
  //フォントサイズ設定
  newText.setAttribute("font-size", "6");
  //文字数が多くて扇形に入りきらない場合、文字サイズを小さくする
  while (newText.getComputedTextLength() > newPath.getTotalLength() - 5) {
    var currentFontSize = parseFloat(newText.getAttribute("font-size")); //parseFloatで文字列を数値に変換する px等の情報を抜く
    newText.setAttribute("font-size", currentFontSize - 0.1);
  }
}

//ルーレットを回転させる
let rouletteAnimation = null;
function SpinWheel(board) {
  if (rouletteAnimation) rouletteAnimation.kill();
  rouletteAnimation = gsap.to(board, {
    rotation: 360,
    duration: 0.5, //0.5秒かけて一回転する
    repeat: -1, //無限ループ
    transformOrigin: "50% 50%", //中心を軸に回転
    ease: "none", //等速回転
  });
}

//増やすボタンクリック
AddListBtn.addEventListener("click", () => {
  var listsCount = $("#ulTodoList li").length;
  //画面内のテキストボックスが10個になるまでは生成可能
  if (listsCount >= 10) {
    alert("項目は10個までにしてね!");
    return;
  }
  //テキストボックスを生成する
  createTxtBox();
});

//テキストボックスを生成しulリスト内に追加する
function createTxtBox() {
  //テキストボックスを生成
  var newTxtBox = document.createElement("input");
  newTxtBox.type = "text";
  newTxtBox.className = "todoBox";
  newTxtBox.maxLength = 15;
  //リストを生成
  var newli = document.createElement("li");
  //リスト内に追加
  newli.appendChild(newTxtBox);
  //ulリスト内に追加
  UlTodoList.appendChild(newli);
}

//止めるボタンクリック
StopBtn.addEventListener("click", () => {
  //ルーレットの回転アニメを取得できなければ抜ける
  if (!rouletteAnimation) return;
  //止めるボタンを隠す
  hideElement(StopBtn);
  //止めるボタンのフェードアウトが完了したらdisplay:noneにする
  StopBtn.addEventListener("transitionend", function handler() {
    displayNoneElement(HiddenBtnStp); //止めるボタンの親divを非表示にする
    StopBtn.removeEventListener("transitionend", handler); //イベントリスナーを削除する
  });
  //数回転分待った後、減速しながらルーレットを止める
  //
  gsap.to(rouletteAnimation, {
    timeScale: 0.001, // 最終速度（ほぼ停止）
    duration: 4.5, // 減速にかける秒数
    ease: "power2.out", // イージング
    delay: 0.5, // 0.5秒待ってから減速開始←これいる？
    onComplete: () => {
      rouletteAnimation.pause();
      //三角形の先が示す領域を取得する
      var sect = getSector();
      var todoStr = getTodoFromSector(sect);
      //結果をテキストに設定
      setResultText(todoStr);
      //結果表示用の要素を表示させる
      displayFlexElement(ResultTexts); //div要素をdisplay:flexにする
      displayFlexElement(HiddenBtnResult); //同上
      //1フレーム後にフェードインさせる（通常ブラウザはCSSをまとめて処理するが、上の処理が終わった「後に」アニメを実行させる！！！）
      requestAnimationFrame(() => {
        hiddenElements2.forEach((element) => {
          if (element.textContent === "") return; //todoStrが取得できなかった場合text要素を表示させない
          showElement(element);
        });
      });
    },
  });
});

function setResultText(todoStr) {
  if (!todoStr) {
    ResultText1.textContent = "あらら？決まらなかったみたい…";
    ResultText2.textContent = "";
    ResultText3.textContent = "もう一度まわす？";
  } else {
    ResultText1.textContent = "それならまずは…";
    ResultText2.textContent = todoStr;
    ResultText3.textContent = "からやってみよう！！";
  }
}

//三角形の先が示す領域を取得する
//
function getSector() {
  var tri = SVGRouletteTri;
  var triPoints = tri.getBoundingClientRect();
  var x = triPoints.left + triPoints.width / 2;
  var y = triPoints.bottom;
  //textpathなどsector以外を取得してしまう場合があるため、要素群からクラスで絞り込む
  var elements = document.elementsFromPoint(x, y + 4);
  console.log(elements);
  var sect = elements
    .find((element) => element.classList.contains("sector"))
    .closest("g");
  return sect;
}

//扇形領域から値を取得する
//
function getTodoFromSector(sect) {
  var textPathList = sect.querySelectorAll("textPath");
  if (textPathList.length == 0) return null;
  //textPath要素の中身をひと繋ぎにする
  var textPath = Array.from(textPathList) //nodelistを配列に変換
    .map((tp) => tp.innerHTML) //出来上がったオブジェクト配列の中身を取り出す
    .join(""); //連結する
  var todoStr = textPath;
  return todoStr;
}

//戻るボタンをクリック
ReturnBtn.addEventListener("click", () => {
  //ルーレット画面全体をフェードアウトで非表示にする
  hideElement(SVGRouletteBase);
  hideElement(HiddenPage);
  hideElement(BlackoutCover);
  //フェードアウトが完了してからルーレットの初期化を行う
  BlackoutCover.addEventListener("transitionend", function handler() {
    resetRoulette();
    BlackoutCover.removeEventListener("transitionend", handler); //イベントリスナーを削除する
  });
});

//もう一度回すボタンをクリック
AgainBtn.addEventListener("click", () => {
  //初期化中に「仕切り直し！」などの画面を上に表示させる（未実装）
  resetRoulette(); //ルーレットの初期化を行う
  //少し間を置き、初期化が完了してから下記処理へ
  RouletteBtn.click(); //回すボタンを自動で押す
});

//次の回転用に諸要素の初期化を行う
function resetRoulette() {
  //visible・display属性を初期化する
  displayFlexElement(HiddenBtnStp);
  displayNoneElement(ResultTexts);
  hideElement(ResultTexts);
  hideElement(ResultText1);
  hideElement(ResultText2);
  hideElement(ResultText3);
  hideElement(AgainBtn);
  hideElement(ReturnBtn);
  //resultTextsの中身を初期化する
  ResultText1.textContent = "";
  ResultText2.textContent = "";
  ResultText3.textContent = "";
  //ルーレット盤の要素を削除する
  //SVGRoulettBoard内にあるgroup0,group1...を削除する
  var groups = SVGRouletteBoard.querySelectorAll("g");
  groups.forEach((group) => {
    if (group.id.startsWith("group")) group.remove();
  });
  //ルーレット盤の回転角を初期化する
  gsap.set(SVGRouletteBoard, { rotation: 0 });
}

//隠し要素を表示させる
function showElement(element) {
  if (element.classList.contains("hidden")) {
    element.classList.remove("hidden");
  }
  element.classList.add("visible");
}

//要素をdisplay:flexにする(フェードイン用)
function displayFlexElement(element) {
  if (element.classList.contains("display-none")) {
    element.classList.remove("display-none");
  }
  element.classList.add("display-flex");
}

//表示させた要素を非表示にする(フェードアウト用)
function hideElement(element) {
  if (element.classList.contains("visible")) {
    element.classList.remove("visible");
  }
  element.classList.add("hidden");
}

//表示させた要素を非表示にする(フェードアウト後にdisplay:noneにする用)
function displayNoneElement(element) {
  if (element.classList.contains("display-flex")) {
    element.classList.remove("display-flex");
  }
  element.classList.add("display-none");
}
