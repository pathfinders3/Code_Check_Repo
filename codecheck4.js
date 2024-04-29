import * as mod from './tiles_module.js';

var canvasRoute = null;

var canvas_3;
// canvas1 is Foreground.
var canvas1_original; // foreground-Original
var canvas1_concurrent_fgi; // 줌 foreground-Zoomed
// canvas2 is Background.
var canvas2_original_bgi; // 1:1 크기의 원본bgi [g_act_x 원본 좌표를 쓴다] 그림 바뀔 수 있음

/** loadNewImage와, Paste(CTRL V)가 바꾼다. */
var canvasParent; // 1:1 크기의 원본bgi : 실행 내내 불변함.

var canvas2_concurrent_bgi = document.createElement('canvas'); // 줌. 변형해 사용 중인 BGI
// [concurrent는 줌 좌표를 쓴다]

var canvasGraph;

var g_eights = []; // 타일간 미들 밸류 정보 보관소(임시, coordies...)
/** coordi.push( {x: tileOrient[ii].x, y: tileOrient[ii].y, mid: superMid1, legMid: -438} ); */


// Add a click event listener to the <span>
const btnCompare9 = document.querySelector('.btnCompare9');
const btnCompareNN = document.querySelector('.btnCompareNN');
const btnMakeGrid = document.querySelector('.btnMakeGrid');
const btnAddPointRoute = document.querySelector('.btnAddPointRoute');

// HTML 문서 내 미리 지정된 인풋 박스 숫자를 읽어서 칸반을 배정하고 그리드를 만든다.
function readHTMLmakeGrid() {
	const kanban = document.getElementById("kanban");
	kanban1 = parseInt(kanban.value);	// e.g. 예를 들면 칸반은 2입니다.
	generateGrid(kanban1);	// n * n.	
}

/** 타일 위치에서 다음 타일로 건너뛰는 이동 버튼 클릭시 리스너 */
function handleButtonClick(event) {
  const button = event.target;  // Get the button element that was clicked
  const direction = button.id.slice(-1); // Extract the direction from button ID

  // Process the click event based on the direction
  switch (direction) {
    case "U":	handleKeyAction(0, -kanban1);     break;
    case "D":	handleKeyAction(0, kanban1);	     break;
    case "L":	handleKeyAction(-kanban1, 0);	     break;
    case "R":	handleKeyAction(kanban1, 0);	     break;
	case "Y":	/*console.warn("XY는 현 처리미비");*/	     break;
    default:    console.warn("Unknown 모르는 버튼 눌려졌음. direction:", direction);
  }
}

// Attach the event listener to all buttons
const buttonsTiles = document.querySelectorAll("button[id^=btnTile]");
buttonsTiles.forEach(button => button.addEventListener("click", handleButtonClick));


btnChkBlurryAll.addEventListener('click', () => {
	/** 가상 캔버스로 한다 */
// var canvas2_original_bgi; // 1:1 크기의 원본bgi [g_act_x 원본 좌표를 쓴다] 그림 바뀔 수 있음
// var canvasParent; // 1:1 크기의 원본bgi : 실행 내내 불변함.
	
	if (undefined == g_act_y) {
		printFormat(64,"Please Mark Y Point, y1 정의 안됨 {0} ", g_act_y);
		return;
	}
	
	// let canvas4 = createCanvasLikeExisting(canvasParent);
	// let width4 = g_imageWidth;//canvasParent.width;
	let strFiles = "";
	let delInfo = [];
	/** 이미지별로 돌린다 . 크리스퍼 쓰려면, 여기서 저장한다. */
	for (let i=0; i<g_images.length; i++) {
		let strFile1;
		
		let canvas4 = createCanvasFromImage(g_images[i]);
		let width4 = g_images[i].width;
		console.log('cvs4:',canvas4);
		
		const [bBlur, blurs] = chkBlurryVirtual(g_imageWidth, g_act_y, 80, canvas4, width4); // 50 tiles to vertical.
		const print1 = printFormat(76,"Blur?{0} File:{1}", bBlur, g_files[i].name);
		//strFiles += print1 + "\n";
		if (bBlur) {
			// 지울 파일 리스트
			strFile1 = "Del; "+g_files[i].name + "\n";
		} else {
			strFile1 = "Nodel "+ g_files[i].name + "\n";
		}
		console.log("삭제or생?",strFile1);
		console.log("🌧🍁블러스:",blurs);
		
		//
		// console.log(g_files[0])
		//coordi.push({ x: 11, y: 22, mid: 128 });
		//delInfo.push({name:g_files[i].name, });
		
		g_imageIdx++;
	}
	
	// 색인값 출력부
	//for (let i=0; i<g_images.length; i++) {
	while (false) {
		let canvas4 = createCanvasFromImage(g_images[i]);
		let width4 = g_images[i].width;
		/** 색인값도 분석 한다 */
		let crisper = getCrisperVirtual(g_act_y, 5, canvas4, width4);//색인값은 길 필요 없다
		printFormat(2451,"Image{0}({2}):색인값 {1}", i,crisper,g_images[i]);
		console.log(crisper);
	}
	
	copyTextToClipboard(strFiles);	// text copied to clipboard!
});


btnTileXY.addEventListener('click', () => {
	let tilex = document.getElementById('tile_x');
	let tiley = document.getElementById('tile_y');
	const xx = Number(tilex.value);
	const yy = Number(tiley.value);
	assert("xx,yy", [xx, yy], 'number','number');
	handleKeyAbsolute(xx,yy, g_act_x, g_act_y); // 소수점 좌표 없애는 목적이 컸다.
});


btnMakeGrid.addEventListener('click', () => {
	readHTMLmakeGrid();
	// const kanban = document.getElementById("kanban");
	// kanban1 = parseInt(kanban.value);	// e.g. 예를 들면 칸반은 2입니다.
	// generateGrid(kanban1);	// n * n.
});

/** 이 버튼은 최대값 넘는지만 보는 버튼... */
btnCompareNN.addEventListener('click', () => {
	compareMinimumValues();
});

// use canvas2_original_bgi (전역)
function changeImageToBlackWhite(img1, color1) {

}

/***
모든 타일에 대한 일괄적 변환.

changeImageToBlackWhite()를 하고 있다. mid1이 기준이다.
그러나, F1으로 한 4*4 구획에서, Mid1 을 한번만 구해서 하고 있기 때문에,
그냥 그래픽 에디터의 B/W 변환이나 다를 바 없는 상황...
그래서 매 4*4 를 지나가면서, Mid1을 많이 구해서 그 즉시 적용을 해야 한다.

mid1 한 값이 아니라 즉, mid1의 배열? 을 줄 수도 있다.
*/
function fillImageWithMonochromeColor(canvas, mid1) {
	var ctx = canvas.getContext('2d');
    // Get the image data
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;

    // Loop through each pixel and set its color to the provided monochrome value
    for (var i = 0; i < data.length; i += 4) {
        // Calculate the luminance value (average of red, green, and blue)
        const lum1 = (data[i] + data[i + 1] + data[i + 2]) / 3;
		const color1 = (lum1 <= mid1) ? 0 : 255;
        // Set red, green, and blue channels to the color value
        data[i] = data[i + 1] = data[i + 2] = color1;
    }
    // Put the modified image data back onto the canvas
    ctx.putImageData(imageData, 0, 0);
    // Replace the image element with the modified canvas
    //imageElement.parentNode.replaceChild(canvas, imageElement);
	
}

function setPixelGrayscale(imageData, x, y, grayscaleValue) {
    // Calculate the index of the pixel in the data array
    var index = (y * imageData.width + x) * 4;

    // Set the red, green, and blue components to the grayscale value
    imageData.data[index] = grayscaleValue;      // Red
    imageData.data[index + 1] = grayscaleValue;  // Green
    imageData.data[index + 2] = grayscaleValue;  // Blue
    // Leave the alpha component unchanged (no transparency change)
}

/***
이것은 타일만 가지고 changeImageToBlackWhite 한다.
*/
function fillTileXY_WithMono(canvas, x1, y1, mid1) {
	var ctx = canvas.getContext('2d');
    // Get the image data
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;	// 여기에다가 새 이미지 데이터를 쓴다.

	const width = imageData.width; 
	const height = imageData.height;
	const sz1 = kanban1;		// 전역변수 kanban.

	if (x1 == 0) {
		console.log(strFormat("(타일) ({0},{1})", x1,y1));// 나열식 배열 출력
	}

	const indices = getImageRegionIndices(canvas, x1, y1, sz1);
	// 위 함수의 리턴값 e.g. [8, 12, 24, 28]
/* 	for (let i=0; i<indices.length; i++) {
		const ii = indices[i]; // e.g. ii:0, ii:4, ...
		data[ii] = data[ii+1] = data[ii+2] = color1;
	}
 */	
	//for (let i=0; i<16; i++) {		
	for (let i=0; i<indices.length; i++) {
    // Loop through each pixel and set its color to the provided monochrome value
        // Calculate the luminance value (average of red, green, and blue)
		const ii = indices[i]; // e.g. ii:0, ii:4, ...
		// [8(8~11), 12(~15), 24(~27), 28(~31)]

		// e.g. ii:8 이면, 8,9,10,11 (한 픽셀 완성)
		/** 소수점이 나올 경우 절삭해야 한다. (calcB 함수를 호출하는 쪽으로 나중에 수정해야)*/
        const lum1 = parseInt((data[ii] + data[ii+1] + data[ii+2]) /3);
		
		// if (mid1 < 10)
			// console.log("루미넌스와 미드:",lum1, mid1);
		
		const color1 = (lum1 <= mid1) ? 0 : 251;
		// const color1 = (lum1 <= 128) ? 0 :251; // 강제화128로 테스트.good.
        // Set red, green, and blue channels to the color value
        data[ii] = data[ii+1] = data[ii+2] = color1;
    }
    // Put the modified image data back onto the canvas
	ctx.putImageData(imageData, 0, 0);
	
	//console.log(x1,y1, "3개다");
} // end of fillTile__XY___Mono()


/***
이것은 타일만 가지고 changeImageToBlackWhite 한다.
*/
function fillTileWithMono(canvas, tile_id, mid1) {
	var ctx = canvas.getContext('2d');
    // Get the image data
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	// var imageData = ctx.getImageData(0, 0, fixW, fixH); // 52,25
    var data = imageData.data;	// 여기에다가 새 이미지 데이터를 쓴다.

	const width = imageData.width; 
	const height = imageData.height;
	const sz1 = kanban1;		// 전역변수 kanban.

	const {x1, y1} = getTileCoords(tile_id, width, height, sz1);
	
	if (x1 == 0) {
		console.log(strFormat("(타일) ({0},{1})", x1,y1));// 나열식 배열 출력
	}
	// console.log(strFormat("(이미지크기) ({0},{1})", width,height));// 나열식 배열 출력
	
	// 여기서 한 개만 가져와야 한다 여러개 가져오는 게 문제.
	// if (width != fixW) {
		// console.error("width fixW different ERROR");
		// debugger;
	// }

	//const indices = getImageRegionIndices(width, height, x1, y1, sz1);
	const indices = getImageRegionIndices(canvas, x1, y1, sz1);
	// e.g.[0, 4, 8, 12] when 2*2
	// console.log('indices',indices[0]);// 좌측 구석을 찍고 있는데 안 해도 됨.
	
	//debugger; // 왜 타일 1개가 더 늘어나나, 이 함수를 실행하면?
	// INSERTION 기능이 있을 리가 없다.
	// x1,y1은 4,0인데, tile_id에서 온다. (1을 주었기 때문)
	//	그 타일만 써야 하는데, 그 다음 모든 타일들을 써버린다...!!!!
	
	//for (let i=0; i<16; i++) {		
	for (let i=0; i<indices.length; i++) {
    // Loop through each pixel and set its color to the provided monochrome value
        // Calculate the luminance value (average of red, green, and blue)
		const ii = indices[i]; // e.g. ii:0, ii:4, ...
		// [8(8~11), 12(~15), 24(~27), 28(~31)]
		
		// e.g. ii:8 이면, 8,9,10,11 (한 픽셀 완성)
        const lum1 = (data[ii] + data[ii+1] + data[ii+2]) /3;
		const color1 = (lum1 <= mid1) ? 0 : 251;
		// const color1 = (lum1 <= 128) ? 0 :251; // 강제화128로 테스트.good.
        // Set red, green, and blue channels to the color value
        data[ii] = data[ii+1] = data[ii+2] = color1;
    }
    // Put the modified image data back onto the canvas
	ctx.putImageData(imageData, 0, 0);
	
	//console.log(x1,y1, "3개다");
	// console.log(mid1, "중간값은...");
}



/** 최대의 거리, 전방 값/거리, 후방 값/거리 5개를 받아서,
측정된 거리 중 최대의 거리가 7 미만이면 배경색으로 간주하여 성과없이 리턴하고,
그 이상이면 전/후방 값 중, 거리와 값 자체의 가중치를 고려하여,
전방값 또는 후방값을 선택하여 리턴한다.

지금 현재는 기본 중간값(mid1)에서 가장 가까운 전방값, 후방값 1개씩만  함수에
주고 있다. 그러나 필요할 경우(값이 정확하게 중간을 가르지 못할 경우),
전방값 리스트, 후방값 리스트 전체를 받아 Evaluate할 수도 있다.
*/
function getSuperMiddle(max_dist, fwd1, bwd1) {
	if (max_dist < 7) {// 먼저 7미만이면 배경일 수 있다.
		const mid2 = 0; // 우측이 다 흰색 간주되므로...
		//setColorTextInDiv('verbose', `SEEMS: 안칠해진 듯:<${max_distance} Not Brushed... 그래서 기준을:${mid2}`, getRandomColor());		
		const msgNoFill = `SEEMS: 안칠해진 듯:<${max_dist} Not Brushed... 그래서 기준을:${mid2}`;
		printMiddleChoosingProcess(msgNoFill);
		
		//debugger;	// 최대 8차이면 안칠해졌다 하는데... 음...
		return mid2;
		
	} else if (fwd1.val == bwd1.val) {
		// 위 조건이 충족하면, 이것들은 미들값과 같다는 뜻이다.
		const msg1 = `평균 DIST값과 일치하므로 그냥 사용 '${fwd1.val}'를. Dists:[F${fwd1.dist},B ${bwd1.dist}]`;
		printMiddleChoosingProcess(msg1);
		//setColorTextInDiv('verbose', `평균 DIST값과 일치하므로 그냥 사용 '${fwd1.val}'를. Dists:[F${fwd1.dist},B ${bwd1.dist}]`, getRandomColor());
		return fwd1.val;
		
	} else if (bwd1.dist >= fwd1.dist) {
		const msg2 = `466;BACKWARD가 더 큼 |${bwd1.val}| Dists:[F=${fwd1.dist},B=${bwd1.dist}]`;
		printMiddleChoosingProcess(msg2);		
		//setColorTextInDiv('verbose', `466;BACKWARD가 더 큼 |${bwd1.val}| Dists:[F=${fwd1.dist},B=${bwd1.dist}]`, getRandomColor());
		return bwd1.val;
		
	} else if (bwd1.dist < fwd1.dist) {
		const msg3 = `FORWARD가 더 큼 |${fwd1.val}| Dists:[F=${fwd1.dist},B=${bwd1.dist}]`;
		printMiddleChoosingProcess(msg3);		
		//setColorTextInDiv('verbose', `FORWARD가 더 큼 |${fwd1.val}| Dists:[F=${fwd1.dist},B=${bwd1.dist}]`, getRandomColor());
		return fwd1.val;		
		
	}
	
  // If none of the values are greater than 7, return None
	return 255;// 알 수 없으므로, 다 검은색화 해버린다.(포기적 리턴) null;
}


/** black and white 만 콘솔로 출력해보는 함수 
	processRegion()과 비슷함.
	x1,y1: 보통 g_act_x, g_act_y
*/
function printClickedRegion(x1, y1) {
	const superMiddle1 = compareRegion(); // 완전 결정난 경계값을 리턴한다.
	
	const print1 = printFormat(217,"주어진元({1},{2}) 수퍼 중간값: {0}", superMiddle1, x1, y1);
	//setNewTextInDiv('verbose', `(${x1},${y1}), 수퍼 중간값: ${superMiddle1}`, getRandomColor());
	setNewTextInDiv('verbose', print1, getRandomColor());
	
	const colors1 = get3x3Colors(canvas2_original_bgi, x1, y1, kanban1);	//
	const briger1 = convertRGBToBrightness(colors1);	// 3-elem array to 1-elem.
	// 타일들을 콘솔에 출력해 본다.
	printElementsWithComparison(briger1, superMiddle1); // 단색으로 출력할 때 0으로...
	
	//return briger1; // 꺾은선 그래프 루틴에서 필요하므로 리턴함.(임시코드가 될 수도)
	return superMiddle1;	// 차라리 꺾은선 그래프용 미들값 리턴.
}

/** black and white 만 콘솔로 출력해보는 함수 : SPAN 타일들도 같이 업데이트한다.
	printClickedRegion()과 비슷함.(전 영역을 할 때, F1 key)
*/
function processRegion(mid1) {
	const colors1 = get3x3Colors(canvas2_original_bgi, g_act_x, g_act_y, kanban1);	//
	const briger1 = convertRGBToBrightness(colors1);	// 3-elem array to 1-elem.
	
	// 타일들을 콘솔에 출력해 본다.
	printElementsWithComparison(briger1, mid1); // 단색으로 출력할 때 0으로...

	let bw1 = getBlackOrWhite(briger1, mid1);
	// 미디움 값으로 흑백을 가른 결과를 큰 TILES로 출력한다.
	generateGridMono(kanban1, bw1);

	// 이 그리드 결과를 메모로 써야 한다.
}


/** 
---- y값 겹치는 (막대) 영역의 길이를 리턴한다.

Y값 막대 겹치는 그림:
https://pasteboard.co/vNZfI12HTXey.png
https://postimg.cc/87k7FyXD
코드:
https://onecompiler.com/javascript/426hx2ykb
*/
function getOverlapRatio(arr1, arr2) {
  // 1. Y좌표 범위 계산
  const [min1, max1] = getMinMax(arr1);
  const [min2, max2] = getMinMax(arr2);

  // 2. 겹치는 Y좌표 범위 계산
  const [overlapMin, overlapMax] = getOverlapMinMax(min1, max1, min2, max2);

  // 3. 겹치는 비율 계산
  const overlapLength = overlapMax - overlapMin + 1;
  const totalLength = Math.max(max1, max2) - Math.min(min1, min2) + 1;
  const overlapRatio = overlapLength / totalLength;

  return {overlapRatio, overlapLength};
}
// Y좌표 최소값과 최대값 계산
function getMinMax(arr) {
  let min = arr[0];
  let max = arr[0];
  for (const y of arr) {
    if (y < min) min = y;
    if (y > max) max = y;
  }
  return [min, max];
}
// 겹치는 Y좌표 범위 계산
function getOverlapMinMax(min1, max1, min2, max2) {
  const overlapMin = Math.max(min1, min2);
  const overlapMax = Math.min(max1, max2);
  return [overlapMin, overlapMax];
}
/** 
e.g. const {overlapRatio, overlapLength} = getOverlapRatio(arr1, arr2);
END---- y값 겹치는 (막대) 영역의 길이를 리턴한다.
*/




/** 
---- 타일 위치로부터, x/y 스텝만큼 이동한 위치를 구한다. (단순 수학적 계산)
*/
function moveTilePosition(x1, y1, x_steps, y_steps, sz1) {
    // Calculate the new x and y coordinates by adding the steps
    var newX = x1 + x_steps * sz1;
    var newY = y1 + y_steps * sz1;

	if (newY < 0 || newX < 0) {
		console.error(strFormat("E252|타일 범위 나감: ({0},{1}) ", newX,newY));
	}
	
    return { x: newX, y: newY };
}

/** 
타일 위치로부터, x/y 스텝만큼 이동한 위치의 무리 4*4(kanban*kanban)만큼 구하여 리턴한다.
개수는 상수로 내부에서 고정인 상황. i*j.
readTilesCoords()?
*/
function readTiles(x1, y1, kanban1, ylong=1, xlongFixed=1) {
  const tileOrient = [];

  for (let i = 0; i < xlongFixed; i++) { // left right는 일단 안 움직임.
    for (let j = 0; j <= ylong; j++) {
      const tileU = moveTilePosition(x1, y1, i, j, kanban1);
      tileOrient.push(tileU);
    }
  }

  return tileOrient; // usage: tileOrient[0].x, tileOrient[0].y
}


/** 
---- 이것은 그림 8-9개 영역에 대해서 구하는 것이다.
Tile ID를 기준으로, UP, 자신, DN 3개를 해본다.
일단 3개부터 한다.
ylong:해당 타일로부터 몇 개를 하느냐(해당 타일 포함하여)
+-+
| |
+-+
| |
+-+
| |
+-+
*/
function getEightCliffs(id1, ylong) {
	let superMids = [];
	
	var ctx = canvas2_original_bgi.getContext('2d');
	var imgData = ctx.getImageData(0, 0, canvas2_original_bgi.width, canvas2_original_bgi.height);
	const {x1, y1} = getTileCoords(id1, imgData.width, imgData.height, kanban1);
	printFormat(322,"클릭된 좌표({0},{1})➔({3},{4}) TID{2}", g_act_x, g_act_y, id1,x1,y1);

	//const {overlapRatio, overlapLength} = getOverlapRatio(arr1, arr2);
	
	// const ylong = 4;
	const tileOrient = readTiles(x1,y1,kanban1, ylong);	// e.g.[xup,yup],[x00,y00]
	// const y00 = tileOrient[0].y; // 테스트 코드
	// printFormat(407,"Id_{0}: {1}_to_{2}↑", id1, y1, y00);

	let tilePlan = [];	// tiles' plan.
	let vIndices = [];
	
	let coordi = [];	// 배열 of SuperMiddles and 그것들의 (x,y)
	
	for (let ii=0; ii<ylong; ii++) {	// e.g. i < tileOrient.length
		//const inbound1 = isTileInBounds(canvas2_original_bgi, x1, y1, kanban1);
		const x11 = tileOrient[ii].x;
		const y11 = tileOrient[ii].y;
		const inbound1 = isTileInBounds(canvas2_original_bgi, x11, y11, kanban1);
		if (false == inbound1) {
			printFormat(445,"📈👣👣TileY좌표 끝도달 {0}/{1}:좌표는{2}", ii,ylong, y11);
			break;
		} else {
			// printFormat(445,"📈🍀🍀TileY좌표_인바운드 {0}/{1}:좌표는{2}", ii,ylong, y11);
		}

		//assert("tilpos x1,y1", tileOrient[i][0], tileOrient[i][1], 'number','number');
		const brSorted1 = getTileBrightness(tileOrient[ii].x, tileOrient[ii].y, kanban1);
		
		// 이 값의 min/max / mid1 값을 구해 출력한다
		const min1 = Math.min(...brSorted1);
		const max1 = Math.max(...brSorted1);
		const mid1 = ((min1+max1) / 2).toFixed(2);	// 'n*n'의 색들에서 중간값.		
		
		const virtualIdx = getVirtualIndex(brSorted1, mid1, true); // 미들값의 인덱스		
		
		const distances = calcDistances(brSorted1);	// 거리들을 계산해놓는다		
		const max_distance = Math.max(...distances);

		/** brSorted1에 있는 값 중에서 Mid1을 중간 기준으로 하여, →FWD, ←BWD로 값 
		kanban 4일 시, 점의 개수는 4*4+1 (mid1값 추가됨)
		*/
		const highsFwd = collectHighFwd(brSorted1, distances, virtualIdx);
		const highsBwd = collectHighBwd(brSorted1, distances, virtualIdx);
		const fwd1 = findFirstNonNullElement(highsFwd); // NULL아닌 첫번째 White.
		const bwd1 = findFirstNonNullElement(highsBwd);	// First Black.
		
		// MID1 고르는 코드가 복잡. 이아래 추가되어야 함.
		const superMid1 = getSuperMiddle(max_distance, fwd1, bwd1);
		
		superMids.push(superMid1);
		// legMid: 미정시 음수로 일단 대입.
		coordi.push( {x: tileOrient[ii].x, y: tileOrient[ii].y, mid: superMid1, legMid: -438} );
		
		tilePlan.push(brSorted1);
		vIndices.push(virtualIdx);
	}
	
/* 	여러 개의 인덱스로 분할 한다. 그러나 , COORDI 로 통합한 후 분할 하려고 주석화.
	const separatedArrays = separateMultipleArrays(tilePlan, vIndices);
	console.log('408',separatedArrays[0], vIndices[0]);
	console.log('409',separatedArrays[1], vIndices[1]); */

	g_eights = coordi;/** !!🌀 MAKE_GLOBAL 전역으로 해서, 보려고 한다.
	[182, 218, 0, 0,... ] 즉 공통MID를 적용하기 전이다.(No LEGEND) 
	g_eights의 전체 구조: https://postimg.cc/tnty3Cw9
	*/
	
	return coordi;	/**{x: tileOrient[ii].x, y: tileOrient[ii].y, mid: superMid1 */
}	// end of getEightCliffs<>

/** 
---- 이것은 Tile x,y를 기준으로, DN 하여 ylong 개수만큼 구하는 것이다.
흐린 부분의 개수를 구해 리턴한다. (0에서 최대 ylong이 됨)
getEightCliffs<> 함수 내부를 분리, 개선한 것이다.
다만 MID값 평가 부분은 없다. (EIGHTCLIFFS함수에서 흐림 판단부를 위해 따로 분리 작성)
ylong:해당 타일로부터 몇 개를 하느냐(해당 타일 포함하여)
+-+
| |
+-+
| |
+-+
| |
+-+
*/
function getEightVerticalBlocks(x1, y1, ylong) {
	// var ctx = canvas2_original_bgi.getContext('2d');
	// var imgData = ctx.getImageData(0, 0, canvas2_original_bgi.width, canvas2_original_bgi.height);
	// const {x1, y1} = getTileCoords(id1, imgData.width, imgData.height, kanban1);

	//const {overlapRatio, overlapLength} = getOverlapRatio(arr1, arr2);
	/** 전체 그림 영역을 넘어가지 않아야 하므로 검사한다(즉, 최초 주어진 어떤 x1/y1 파라메터라도 문제없이 COUNT or DISCARD 가능함) */
	const inbound1 = isTileInBounds(canvas2_original_bgi, x1, y1, kanban1, g_imageWidth);
	if (false == inbound1) {
		printFormat(445,"📈👣👣TileY좌표 끝도달 ({0},{1}):갈 타일수{2}", x1,y1,ylong);
		return -517;
	} else {
		// printFormat(445,"📈🍀👣TileY좌표_인바운드 ({0},{1}):갈 타일수{2}", x1,y1,ylong);
	}

	const tileOrient = readTiles(x1,y1,kanban1, ylong);	// e.g.[xup,yup],[x00,y00]

	let cntBlur = 0;
	
	let coordi = [];	// 배열 of SuperMiddles and 그것들의 (x,y)
	
	for (let ii=0; ii<ylong; ii++) {	// e.g. i < tileOrient.length
		const x11 = tileOrient[ii].x;
		const y11 = tileOrient[ii].y;
		
		//assert("tilpos x1,y1", tileOrient[i][0], tileOrient[i][1], 'number','number');
		const brSorted1 = getTileBrightness(tileOrient[ii].x, tileOrient[ii].y, kanban1);
		//const xfive = calculateVerticalDivisions(imageWidth, 4);		
		
		// 이 값의 min/max / mid1 값을 구해 출력한다
		const min1 = Math.min(...brSorted1);
		const max1 = Math.max(...brSorted1);
		const mid1 = ((min1+max1) / 2).toFixed(2);	// 'n*n'의 색들에서 중간값.		


		/** 수퍼 미들 구하는 부분은 생략한다, 대신 블러리 체크.
		*/
		//let tf = isTileMMMBlurry(wit1[i].min0, wit1[i].max0, 140, 230);
		let tf = isTileMMMBlurry(min1, max1, 140, 230); /** 140~230은 아직 상수이다. **/
		if (tf)
			cntBlur++;
		else
			break;
	}
	
	
	// return coordi;	/**{x: tileOrient[ii].x, y: tileOrient[ii].y, mid: superMid1 */
	return cntBlur;
}

/** 해당 이미지의 🎆크리스퍼 색인🎆을 리턴한다. */
function getCrisperVirtual(y1, ylong, canvas4, width4) {

	const xfive = calculateVerticalDivisions(width4, 4);
	const x1 = xfive[0];
	
	//const {overlapRatio, overlapLength} = getOverlapRatio(arr1, arr2);
	/** 전체 그림 영역을 넘어가지 않아야 하므로 검사한다(즉, 최초 주어진 어떤 x1/y1 파라메터라도 문제없이 COUNT or DISCARD 가능함) */
	const inbound1 = isTileInBounds(canvas4, x1, y1, kanban1, width4);
	if (false == inbound1) {
		printFormat(445,"📈👣👣TileY좌표 끝도달 ({0},{1}):갈 타일수{2}", x1,y1,ylong);
		return -517;
	} else {
		// printFormat(445,"📈🍀👣TileY좌표_인바운드 ({0},{1}):갈 타일수{2}", x1,y1,ylong);
	}

	const tileOrient = readTiles(x1,y1,kanban1, ylong);	// e.g.[xup,yup],[x00,y00]

	let cntBlur = 0;
	
	let crisper = [];
	let values = [];
	// 타일 개수만큼 돈다.
	for (let ii=0; ii<ylong; ii++) {	// e.g. i < tileOrient.length
		const x11 = tileOrient[ii].x;
		const y11 = tileOrient[ii].y;
		
		//assert("tilpos x1,y1", tileOrient[i][0], tileOrient[i][1], 'number','number');
		// const brSorted1 = getTileBrightness(tileOrient[ii].x, tileOrient[ii].y, kanban1);
		const brSorted1 = getTileBrightnessVirtual(canvas4, tileOrient[ii].x, tileOrient[ii].y, kanban1);

		//const min1 = Math.min(...brSorted1);
		const avg1 = Math.round(brSorted1.reduce((a, b) => a + b, 0) / brSorted1.length);
		crisper.push(avg1);

		values.push(avg1);
		/** 수퍼 미들 구하는 부분은 생략한다, 대신 블러리 체크.		*/

	}

	
	//console.log('values?',values);
	console.log('crisper?',crisper);
	
	// /**{x: tileOrient[ii].x, y: tileOrient[ii].y, mid: superMid1 */
	return crisper;	// list of avg. br 값들.
}

/** 
---- 이것은 Tile x,y를 기준으로, DN 하여 ylong 개수만큼 구하는 것이다.
흐린 부분의 개수를 구해 리턴한다. (0에서 최대 ylong이 됨)
getEightCliffs<> 함수 내부를 분리, 개선한 것이다.
다만 MID값 평가 부분은 없다. (EIGHTCLIFFS함수에서 흐림 판단부를 위해 따로 분리 작성)
ylong:해당 타일로부터 몇 개를 하느냐(해당 타일 포함하여)
+-+
| |
+-+
| |
+-+
| |
+-+
*/
function getEightVertiBlocksVirtual(x1, y1, ylong, canvas4, width4) {
	//const {overlapRatio, overlapLength} = getOverlapRatio(arr1, arr2);
	/** 전체 그림 영역을 넘어가지 않아야 하므로 검사한다(즉, 최초 주어진 어떤 x1/y1 파라메터라도 문제없이 COUNT or DISCARD 가능함) */
	// if (undefined == y1) {
	// }
	
	const inbound1 = isTileInBounds(canvas4, x1, y1, kanban1, width4);
	if (false == inbound1) {
		printFormat(445,"📈👣👣TileY좌표 끝도달 ({0},{1}):갈 타일수{2}", x1,y1,ylong);
		return -517;
	} else {
		// printFormat(445,"📈🍀👣TileY좌표_인바운드 ({0},{1}):갈 타일수{2}", x1,y1,ylong);
	}

	const tileOrient = readTiles(x1,y1,kanban1, ylong);	// e.g.[xup,yup],[x00,y00]

	let cntBlur = 0;
	/**{x: tileOrient[ii].x, y: tileOrient[ii].y, mid: superMid1 */
	//let coordi = [];	// 배열 of SuperMiddles and 그것들의 (x,y)
	
	for (let ii=0; ii<ylong; ii++) {	// e.g. i < tileOrient.length
		const x11 = tileOrient[ii].x;
		const y11 = tileOrient[ii].y;
		
		const brSorted1 = getTileBrightnessVirtual(canvas4, tileOrient[ii].x, tileOrient[ii].y, kanban1);
		
		// 이 값의 min/max / mid1 값을 구해 출력한다
		const min1 = Math.min(...brSorted1);
		const max1 = Math.max(...brSorted1);
		const mid1 = ((min1+max1) / 2).toFixed(2);	// 'n*n'의 색들에서 중간값.		


		/** 수퍼 미들 구하는 부분은 생략한다, 대신 블러리 체크.
		*/
		//let tf = isTileMMMBlurry(wit1[i].min0, wit1[i].max0, 140, 230);
		let tf = isTileMMMBlurry(min1, max1, 140, 230); /** 140~230은 아직 상수이다. **/
		if (tf)
			cntBlur++;
		else
			break;
	}
	
	return cntBlur;
}


/** chkBlurry함수에서, 라인 그리는 부분만 떼어옴 */
function drawBlurLines(imageWidth, act_y, numTiles=80) {
	const xfive = calculateVerticalDivisions(imageWidth, 4);	
	// 잘라질 화면을 그려서 보여준다.
	drawVLinesIndicator(act_y, xfive, numTiles);
}

function chkBlurry(imageWidth, act_y, numTiles) {

	if (undefined == y1) {
		printFormat(64,"Please Mark Y Point, y1 정의 안됨 {0} ", act_y);
		return;
	}
	
	const xfive = calculateVerticalDivisions(imageWidth, 4);
	printFormat(2378,"XFIVE {0}", xfive);
	console.log(xfive);

	let cc = [];
	for (let i=0; i<xfive.length; i++) {	// 주로 5회전.
		let ret = getEightVerticalBlocks(xfive[i], act_y, numTiles); // e.g. 50 tiles.
		cc.push(ret);
	}
	console.log(cc);
	setNewTextInDiv('verbose', `☁🌧🍁(흐린부분 R 개수:${cc[0]},${cc[1]},${cc[2]},${cc[3]}|4개이상시:${cc[4]})`, getRandomColor());
	
	// 잘라질 화면을 그려서 보여준다.
	//drawBlurLines(imageWidth, act_y, xfive);	// 안보여주는 걸로...(drawblurlines에서 보임)
	// drawVLinesIndicator(act_y, xfive);
	
	// return cc.every(element => element === numTiles);
	return cc.some(element => element === numTiles);	
}

/** 캔버스를 따로 준다.
세로방향으로 4개의 줄을 그어 블러리 검사하는 것.+
가로방향도... */
function chkBlurryVirtual(imageWidth, act_y, numTiles, canvas4, width4) {
	
	if (undefined == act_y) {
		printFormat(64,"Please Mark Y Point, y1 정의 안됨 {0} ", act_y);
		return;
	}
	
	const xfive = calculateVerticalDivisions(imageWidth, 4);

	let cc = [];
	for (let i=0; i<xfive.length; i++) {	// 주로 5회전.
		let blurs5 = getEightVertiBlocksVirtual(xfive[i], act_y, numTiles, canvas4, width4); 
		cc.push(blurs5); // e.g.[50,50,0,50]
	}
	console.log(cc, '기대개수:', numTiles);
	setNewTextInDiv('verbose', `☁🌧🍁(흐린부분 R 개수:${cc[0]},${cc[1]},${cc[2]},${cc[3]}|4개이상시:${cc[4]})`, getRandomColor());
	
	// 흐리려면, 모든 요소가 numTiles, e.g. 50여야 한다.
	// return cc.every(element => element === numTiles);
	return [cc.some(element => element === numTiles), cc];
}

/** 
---- 그 타일의 밝기 배열을 리턴한다.
e.g. copyMid(1, 2, coordi); 
coordi.push({ x: 11, y: 22, mid: 128 });
coordi.push({ x: 11, y: 22, mid: 15 });
*/
function copyMid(sourceIndex, destinationIndex, coordi) {
    if (sourceIndex < 0 || sourceIndex >= coordi.length ||
        destinationIndex < 0 || destinationIndex >= coordi.length) {
        console.error("Invalid source or destination index.");
        return;
    }
    coordi[destinationIndex].mid = coordi[sourceIndex].mid;
}

function copyLegMid(sourceIndex, destinationIndex, coordi) {
    if (sourceIndex < 0 || sourceIndex >= coordi.length ||
        destinationIndex < 0 || destinationIndex >= coordi.length) {
        console.error("Invalid source or destination index.");
        return;
    }
    coordi[destinationIndex].mid = coordi[sourceIndex].legMid;
	coordi[destinationIndex].legMid = coordi[sourceIndex].legMid;
}

/**
소스: https://onecompiler.com/javascript/42894gc45

const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const resultArray = assignValuesBetweenIndices(array, 2, 7, 100, 200);

Output:
Resulting Array: [   1,   2, 100, 100, 100,  200, 200, 200,   9,  10 ]
*/
function assignValuesBetweenIndices(arr, i1, i2, v1, v2) {
    if (!Array.isArray(arr) || i1 < 0 || i2 < 0 || i1 >= arr.length || i2 >= arr.length || i2 <= i1) {
        console.error("Invalid input.");
        return;
    }

    const range = i2 - i1 + 1;
    const halfRange = Math.floor(range / 2);

    // Assign v1 to the first half of the range
    for (let i = i1; i < i1 + halfRange; i++) {
        arr[i] = v1;
    }
    // Assign v2 to the second half of the range
    for (let i = i1 + halfRange; i <= i2; i++) {
        arr[i] = v2;
    }

    return arr;
}

/**
소스: https://onecompiler.com/javascript/427zj9acv

const inputArray = [255, 202, 15, 203, 198, 155, 3333, 16];
const copiedValues = stainBlackValues(inputArray);

Output: Result: [ 255, 202, 15, 15, 15, 15, 15, 15]

설명: copy the previous value to the current index,
1) if previous index value is smaller than current index value, or
2) if current index is larger than 255,

배열 덮어쓰기 카피 설명 도표:
https://pasteboard.co/JwHZJxSc74gC.png
https://postimg.cc/mthzF41f
*/
function stainBlackValues(arr) {
    if (!Array.isArray(arr) || arr.length === 0) {
        console.error("Invalid input array.");
        return null;
    }

    const result = [arr[0]]; // Initialize result array with the first element

    for (let i = 1; i < arr.length; i++) {
        const prevValue = result[i - 1];
        const currentValue = arr[i];

        if (prevValue == 0) {
            result.push(currentValue); // Keep current value unchanged
		} else if (25 > Math.abs(prevValue-currentValue)) {	// 15를 슬라이드 바로
			// 별 차이 없으면, 현재값을 그대로 쓴다.
			result.push(currentValue); // Keep current value unchanged
        } else if (prevValue < currentValue || currentValue > 255) {
            result.push(prevValue); // Copy previous value to current index
        } else {
            result.push(currentValue); // Keep current value unchanged
			printFormat(593,"現현재값({0})",currentValue);
        }

        // if ( (prevValue < currentValue) || currentValue > 255) {
            // result.push(prevValue); // Copy previous value to current index
        // } else {
            // result.push(currentValue); // Keep current value unchanged
        // }
    }
	
    return result;
}


/**
소스: https://onecompiler.com/javascript/428agxtz9

const inputArray = [255, 202, 15, 203, 198, 155, 3333, 16];
const copiedValues = stainBlackValues(inputArray);

Output: Result: [ 255, 202, 15, 15, 15, 15, 15, 15]

설명: copy the previous value to the current index,
1) if previous index value is smaller than current index value, or
2) if current index is larger than 255,
*/
function extractMidValues(array) {
    // Check if the input is an array
    if (!Array.isArray(array)) {
        throw new Error("Input is not an array");
    }

    // Extract 'mid' values from each object in the array
    const midValues = array.map(obj => obj.mid);

    return midValues;
}




/** 
---- 그 타일의 밝기 배열을 리턴한다.
*/
function getTileBrightness(x1, y1, sz1) {
	const colors1 = get3x3Colors(canvas2_original_bgi, x1, y1, kanban1);	//
	const briger1 = convertRGBToBrightness(colors1);	// 3-elem array to 1-elem.
	
	const brSorted1 = sortArray1(briger1);		

	return brSorted1;
}
/** 
---- 지정된 가상 캔버스에서, 그 타일의 밝기 배열을 리턴한다.
*/
function getTileBrightnessVirtual(canvas4, x1, y1, sz1) {
	const colors1 = get3x3Colors(canvas4, x1, y1, kanban1);	//
	const briger1 = convertRGBToBrightness(colors1);	// 3-elem array to 1-elem.
	
	const brSorted1 = sortArray1(briger1);		

	return brSorted1;
}


/** 
---- 이것은 그림 8-9개 영역에 대해서 구하는 것이다.
Tile ID를 기준으로 한다????
일단 3개부터 한다.
*/
//function getEightSuperMids(id1) {




/** F1; 최소값 정해놓고 넘는지를 리턴한다 
	return; 중간값(super middle value) e.g. 128
*/
function compareRegion() {
	const brightGap = Number(document.getElementById('rangeBright').value);//소티드배열에서 몇번째 (슬라이드바는 현재 사용 안함)
	
	// 클릭 안됐을 시에는 x/y 좌표가 없으므로 클릭 후 실행함에 유의.
	const colors1 = get3x3Colors(canvas2_original_bgi, g_act_x, g_act_y, kanban1);	
	
	const briger1 = convertRGBToBrightness(colors1);	// 3-elem array to 1-elem.
	g_bright9 = [...briger1];
	// 정렬해서 줘야 정확한 거리 목록을 구할 수 있다.
	const brSorted1 = sortArray1(briger1);
	g_bright9sort = [...brSorted1];
	// 이 값의 min/max / mid1 값을 구해 출력한다
	const min1 = Math.min(...brSorted1);
	const max1 = Math.max(...brSorted1);
	let mid1 = ((min1+max1) / 2).toFixed(2);	// 'n*n'의 색들에서 중간값.
	//const median1 = getMedian(brSorted1);

	/** 미들값을 출력함 */
	console.log(`min-max: (${min1}~${max1}), Mid1:${mid1}, 중앙값:${mid1}`);
	//setColorTextInDiv('verbose', `In (${min1}~${max1}),미들값(mid1): ${mid1}❗ `, getRandomColor());
	
	const virtualIdx = getVirtualIndex(brSorted1, mid1, true); // 미들값의 인덱스
	
	//setColorTextInDiv('verbose', `미들값(mid1): ${mid1}의 인덱스:${virtualIdx}❗ `, getRandomColor());
	
	/*** 두개의 배열을 동시에 소트해야 한다.
	https://pasteboard.co/up3OPrUdJ2VP.png	*/
	
	const distances = calcDistances(brSorted1);	// 거리들을 계산해놓는다
	// brSorted1: [87, 89, 90, 90, 98, 98, 101... 118, 120]
	// distances: [+2, +1, +0, +8, +0, +3, +1, +5, ... ]
	// dist9
	// virtuaIndex : 8.(mid1의 위치)
	// Vi에서부터, 좌우로 검색한다. 
	// distance 가 평균이상이면, Ok.
	
	// collectHighFwd(): 파라메터는 자연수 배열 'brSorted1', 정수 배열 'distances', 시작 인덱스. 이중 'distances' 요소의 평균보다 큰 값들만 반환
	
	/** brSorted1에 있는 값 중에서 Mid1을 중간 기준으로 하여, →FWD, ←BWD로 값 */
	const highsFwd = collectHighFwd(brSorted1, distances, virtualIdx);
	const highsBwd = collectHighBwd(brSorted1, distances, virtualIdx);
	const fwd1 = findFirstNonNullElement(highsFwd);
	const bwd1 = findFirstNonNullElement(highsBwd);
	
	// highsFWD e.g.[107,122...] 가 너무 먼지 체크한다. 너무 멀지 않고 적당히 가깝다면, 
	// 중간 분할값(midDivider1)으로 인정한다.
	// 너무 멀다면, 이상한 것이다. 
	console.log('순방향 포워드',highsFwd);
	console.log('순방향 백워드',highsBwd);
	
	console.log('전방 ONE의 정보', fwd1);
	console.log('후방 ONE의 정보', bwd1);
	
	const max_distance = Math.max(...distances);
	const superMid1 = getSuperMiddle(max_distance, fwd1, bwd1);
	/*
	const max_distance = Math.max(...distances);
	if (max_distance < 7) {// 7미만이면 배경일 수 있다.
		const mid2 = 0; // 우측이 다 흰색 간주되므로...
		printMiddleChoosingProcess(msgNoFill);
		
		//debugger;	// 최대 8차이면 안칠해졌다 하는데... 음...
		return mid2; 
		....... .......
	*/
	//console.log(distances.length, "길이"); // 15, Why NOT 16?
	
	g_dist9 = [...distances];
	g_dist9sort = sortDescend(distances);// 큰 순서로 소트
	/** dist9sort 에서 거리를 꺼내어, mid1까지의 스텝을 비교한다 */
	
	// return null;	

	// if (superMid1 == null) {
		// debugger;	// 아무 조건도 충족 안할 시 이쪽으로 온다.		
		// return null;
	// }
	return superMid1;

	
	/** 안 소트된 거리 배열에서, 소트된 거리 배열을 찾는다. 
	찾은 인덱스는, briger1의 인덱스와 같을 것이다.
	https://pasteboard.co/V6VyGHypyx09.png (도표로 설명)
	*/

}

/** 
에러 메시지에 변수명을 표시하기 위한 함수. 여러 변수 측정시, 배열로 줘야한다.
  asert(인덱스, [1, 2, 3], 'number', 'number', 'number'); // 여러 변수 측정시, 배열로 줘야한다.
  asert(인덱스, 10, 'number');           // Parameter 10, OK
  asert(코멘트, "hello", 'string');      // Parameter '...', OK
  asert(코멘트나 인덱스, {}, 'object');          // This will throw an error

assert("x1,y1,sz1,sz1", [x1, y1, sz1, sz1], 'number','number','number','number');
  
 */
function assert(ii, values, ...expectedTypes) {
  if (values.length !== expectedTypes.length) {
    throw new TypeError('Number of values and expected types must match.');
  }

  for (let i = 0; i < values.length; i++) {
    if (typeof values[i] !== expectedTypes[i]) {
      const valueType = typeof values[i];
      const expectedType = expectedTypes[i];
      throw new TypeError(`(${ii}) Argument at ${i}th: '${expectedType}'여야 하지만 '${valueType}'이 발견.`);
    }
  }
}


/** 
편차 등의 데이터
 */
function printNumberData(arr) {
	console.log(Math.max(...arr));
	console.log(Math.min(...arr));	
}

/** 
const myArray = [10, 5, 15, 2, 8];
const middleValue = 7;
printElem..WithComparison(myArray, middleValue);
 */
function printElementsWithComparison(arr, middleValue) {
  // Check if the array is 1D and all elements are numbers
  if (!Array.isArray(arr) || !arr.every(item => typeof item === 'number')) {
    throw new Error("2D? The Array must be a 1D array of numbers in printElementsWithComparison()");
  }

  // Iterate through the array, printing each element and its comparison
  for (let i = 0; i < arr.length; /*i+=4 계수는 최종 줄에서 증가시킨다*/) {
	let row1 = '';
	//for (let j=0; j<4; j++) {
	for (let j=0; j<kanban1; j++) {
		let element = arr[i+j];	// ROW첫줄에서 0~3까지 더하며 반복한다.

		if (i+j >= arr.length) {
			console.error(`ROW+COL이 맞게 설정되지 않은 것 같음. (${i}+${j}) vs ${arr.length}`);
			alert(`ROW+COL이 맞게 설정되지 않은 것 같음. (${i}+${j}) vs ${arr.length}`);
		}
		
		let isGreaterThanMiddle = (element > middleValue) ? "⬜":"⬛";
	
		row1 += `${element.toString().padStart(3, '_')}(${isGreaterThanMiddle}) `;		
	}
	console.log(row1);	
	
	i += kanban1;	// j가 가로로 이동하며 더하므로 i로는 다음줄로 간다.
  }
  
	const min1 = Math.min(...arr);	// arr: Briger, brsorted1, etc.
	const max1 = Math.max(...arr);
	const diff1 = max1 - min1;
  
  printFormat(922,"이Tile의 min값:{1}, mid1:{0}, max값:{2}, 대소차:{3}", middleValue, min1, max1, diff1);
  
  // columns' characteristics
  const colt = getColMinMax(arr, kanban1); //Output: {0:[1,3], 1:[4,6], 2:[7,9]}
  printFormat(922,"Columns 특징:{0}", colt);
  console.log(colt);
}

/** 
const myArray = [10, 5, 15, 2, 8];
const middleValue = 7;
let bw_array = printElementsWithComparison(myArray, middleValue);
so bw_array = [true,false,true,...];
 */
function getBlackOrWhite(arr, middleValue) {
  // Check if the array is 1D and all elements are numbers
  if (!Array.isArray(arr) || !arr.every(item => typeof item === 'number')) {
    throw new Error("2D? The Array must be a 1D array of numbers in printElementsWithComparison()");
  }

	let bw1 = [];
	for (let i = 0; i < arr.length; i++) {
		let element = arr[i];	// ROW첫줄에서 0~3까지 더하며 반복한다.
		//let isGreaterThanMiddle = (element > middleValue) ? "⬜":"⬛";		
		let isGreaterThanMiddle = (element > middleValue); //즉 중앙값은 검정으로 처리됨.
		bw1.push(isGreaterThanMiddle);
	}

	return bw1;
}


/** 밝기 배열 받아서 새 밝기차 배열을 리턴한다.
단독으로 잘 쓰일 일이 없다. 
eg.
*/
function calcDistances(arr) {
  // Check if the array has at least two elements
  if (arr.length < 2) {
    console.error("Array should have at least two elements");
    return [];
  }

  // Initialize an array to store distances
  const distances = [];

  // Iterate through the array to calculate distances
  for (let i = 1; i < arr.length; i++) {
    // Calculate the absolute difference between consecutive elements
    const distance = Math.abs(arr[i] - arr[i - 1]);

    // Push the calculated distance to the distances array
    distances.push(distance);
  }
  // distances[n]는 n~(n+1)간 거리.
  return distances;
}

/** 3-Element array to 1-Element array.
return : Single-Element's array.
 */
function convertRGBToBrightness(rgbArray) {
  // Ensure the input array contains arrays of three elements each
  if (!rgbArray.every(color => color.length === 3)) {
    throw new Error("Invalid input: Each color array must have three elements (r, g, b)");
  }

  // Create an array to store the grayscale values
  const grayscaleArray = [];

  // Iterate through each color in the input array
  for (const [r, g, b] of rgbArray) {
	const grayscale = calcPixelBrightness([r,g,b]);
	grayscaleArray.push(grayscale);
    // const grayscale = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    // grayscaleArray.push(grayscale);
  }

	return grayscaleArray;	//정렬되지 않은 상태로 리턴한다
	
	// 알아보기 위해서는 원래의 color1+gray 배열을 소트하는 게 더 보기 편하지만...
  //const sorted1 = sortArray1(grayscaleArray);
  //return sorted1;
  
  // 알아보기 위해서는 원래의 color1 배열을 소트하는 게 더 보기 편하다.
  // 그러나 중간값을 구하고 나면, color1 원래 배열을 사용해서 4*4 화면을 표시해야 한다. 그래서 sorted2는 만들 필요가 없다.
  //const sorted2 = sortArray2(grayscaleArray, rgbArray);
  //console.log("정렬된 BRIG 배열:",sorted2[0]);
  //console.log("정렬된 색 배열:",sorted2[1]);
  
  //return sorted2[0];
  
}


/**
	주어진 배열의 'val'요소가 null이 아닌 첫 번째 요소를 반환
*/
function findFirstNonNullElement(arr) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].val !== null && arr[i].val !== undefined) {
            //return arr[i].val;
			return arr[i];
        }
    }
    //return null; // Return null if no non-null element found
	return {val:'FullyNull', dist:null };
}


/** 특정값 이상(distances의 평균 이상)인 요소들을 리턴한다.
  시작하는 중앙 인덱스가 따로 있다.
 */
function collectHighFwd(brSorted1, distances, startIndex) {
    // Calculate the average of elements in the distances array
    const average = distances.reduce((sum, num) => sum + num, 0) / distances.length;
	/** console.log('[🌍log00] avg를-넘어야...',average);*/
    const collectedElements = [];

    // Iterate over the brSorted1 array starting from the specified index
    for (let i = startIndex; i < brSorted1.length; i++) { // →	
        // Check if the element is larger than the average of distances
		if (distances[i] > average) {
            // If yes, add it to the collectedElements array
			const elem1 = { val:brSorted1[i], dist:distances[i] };
            collectedElements.push(elem1);
        } else {
			const elem0x = { val:null, dist:distances[i] };// ✖✖null
            collectedElements.push(elem0x);
		}
    }

    return collectedElements;
}

function collectHighBwd(brSorted1, distances, startIndex) {
    const average = distances.reduce((sum, num) => sum + num, 0) / distances.length;
    const collectedElements = [];

    // Iterate over the brSorted1 array starting from the specified index
		for (let i = startIndex; i >= 0; i--) { // ←
        // Check if the element is larger than the average of distances
		if (distances[i] > average) {
            // If yes, add it to the collectedElements array
			const elem1 = { val:brSorted1[i], dist:distances[i] };
            collectedElements.push(elem1);
        } else {
			const elem0x = { val:null, dist:distances[i] };// ✖✖null
            collectedElements.push(elem0x);
		}
    }

    return collectedElements;
}

/** 여러 개의 배열을 '기준 인덱스 vi를 중심'으로 분리하고 싶기 때문에 SeparateArrayWithIndex()를 한번만  사용할 수는 없고 여러 번 사용해야 합니다.
 */
function separateMultipleArrays(arrays, vIndices) {
    var separatedArrays = [];
    for (var i = 0; i < arrays.length; i++) {
        //separatedArrays.push(separateArrayWithIndex(arrays[i], vi));
		separatedArrays.push(separateArrayWithIndex(arrays[i], vIndices[i]));
    }
    return separatedArrays;
}

function separateArrayWithIndex(arr, vi) {
    if (vi < 0 || vi >= arr.length) {
        return "Invalid index";
    }
    
    var firstArray = arr.slice(0, vi + 1);
    var secondArray = arr.slice(vi + 1);
    
    return [firstArray, secondArray];
}


/** 밝기차 배열에서, 가장 큰 값의 인덱스를 리턴한다.
calcDistances()와 함께 사용.
 */
function getIndexOfBiggestDistance(arr) {
  // Check if the array is empty
  if (arr.length === 0) {
    console.error("Array is empty");
    return -1; // Return -1 to indicate an error or an empty array
  }

  let maxDistance = arr[0];
  let maxIndex = 0;

  // Iterate through the array to find the index of the largest value
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > maxDistance) {
      maxDistance = arr[i];
      maxIndex = i;
    }
  }

  return maxIndex;
}

/** 밝기차 배열에서, n번째로 큰 값의 인덱스를 리턴한다. (n은 0을 첫번째로 하자)
SORT기능 포함
 */
function getNthIndexOfBiggestDistance(arr, n) {
  // Check if the array is empty
  if (arr.length === 0) {
    console.error("Array is empty");
    return -1; // Return -1 to indicate an error or an empty array
  }

  // Sort the array in descending order
  const sortedArray = arr.slice().sort((a, b) => b - a);

  // console.log('솔티드Array:',sortedArray);
  return arr.indexOf(sortedArray[n]);
}



/** 픽셀 하나(r,g,b)를 주면 그것의 밝기를 리턴한다. 
 */
function calcPixelBrightness(color) {
  // Ensure the color is valid
  if (!Array.isArray(color) || color.length !== 3) {
    throw new Error('Invalid color format. Expected an array with three values [R, G, B].');
  }

  // Calculate brightness using the average of RGB values
  const brightness = (color[0] + color[1] + color[2]) / 3;
  const bright2 = parseInt(brightness);

  return bright2;
}

/** 주어진 색의 종류를 문자로 리턴한다 
eg. const kind1 = getColorKindFromRGB_HSL(colors1[cnt]);
	console.log(colorKind); // Output: 'dark gray'
*/
function getColorKindFromRGB_HSL(col1) {
  // Normalize RGB values to the range [0, 1]
  const [r,g,b] = [col1[0], col1[1], col1[2]];

  const normalizedR = r / 255;
  const normalizedG = g / 255;
  const normalizedB = b / 255;

  // Calculate HSL values
  const max = Math.max(normalizedR, normalizedG, normalizedB);
  const min = Math.min(normalizedR, normalizedG, normalizedB);
  const l = (max + min) / 2;

  let h, s;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case normalizedR:
        h = (normalizedG - normalizedB) / d + (normalizedG < normalizedB ? 6 : 0);
        break;
      case normalizedG:
        h = (normalizedB - normalizedR) / d + 2;
        break;
      case normalizedB:
        h = (normalizedR - normalizedG) / d + 4;
        break;
    }

    h /= 6;
  }

  // Categorize based on HSL values
  if (l > 0.8) {
    return 'white1'; // 진 화이트
  } else if (l < 0.1) {
    return 'black1'; // 진 블랙
  } else if (s < 0.1) {
    return l > 0.5 ? 'white2' /*light_gray*/ : 'black2' /*'dark_gray'*/;
  } else {
    const hue = h * 360;

    if (hue >= 0 && hue < 50) {
		//console.log("red 휴HUE", hue);
      return 'red';
    } else if (hue >= 50 && hue < 100) {
		//console.log("yello 휴HUE", hue);
      return 'yellow';
    } else if (hue >= 100 && hue < 160) {
		console.log("green 휴HUE", hue);
      return 'green';
    } else if (hue >= 160 && hue < 300) {
      return 'blue';
    } else if (hue >= 250 && hue <= 320) {
      return 'magenta';
    } else if (hue >= 320 && hue <= 360) {
      return 'red360';
    } else {
		console.log("언노운 휴HUE", hue);
      return 'unknown';
    }
  }
}

// Example usage:
// const colorKind = getColorKindFromRGB_HSL(255, 0, 0); // Red color
// console.log(colorKind); // Output: 'red'

// to sort an array in ascending order. 
/**  주어진 밝기 배열을 소트한다 (어떤 배열이든 소트함)
 */
function sortArray1(arr) {
	
  // Create a copy of the array using the spread operator
  const sortedArr = [...arr];

  // Sort the copy
  sortedArr.sort((a, b) => a - b);

  return sortedArr;
}

function sortDescend(arr) {
	const decreasing = arr.slice().sort((a, b) => b - a);

	return decreasing; 
}



/** 배열을 다른 배열과 함께 소트한다.(2번째 배열을 같은 순서로)
 */
function sortArray2(arr1, arr2) {
  // Combine the arrays into a single array of tuples, preserving the original indices
  const combined = arr1.map((x, i) => [x, arr2[i], i]);

  // Sort the combined array based on the first element (arr1 values)
  combined.sort((a, b) => a[0] - b[0]);

  // Separate the sorted arrays back into their original forms
  const sortedArr1 = combined.map(x => x[0]);
  const sortedArr2 = combined.map(x => x[1]);

  return [sortedArr1, sortedArr2];
}


/** 좌표에 해당하는 타일 ID를 리턴.
e.g. getTileID(x1, y1, imageWidth, imageHeight, tileSize)
구간을 넘어가면 에러가 난다.
*/
function getTileID(x1, y1, imageWidth, imageHeight, sz1) {
    // Calculate the number of tiles in a row
    var tilesPerRow = Math.ceil(imageWidth / sz1);

    // Calculate the tile's column and row indices
    var colIndex = Math.floor(x1 / sz1);
    var rowIndex = Math.floor(y1 / sz1);

    // Ensure the coordinates are within the image boundary
    if (colIndex < 0 || colIndex >= tilesPerRow || rowIndex < 0 || rowIndex >= Math.ceil(imageHeight / sz1)) {
        console.error("Coordinates are out of bounds.");
        return -1; // Return -1 if coordinates are out of bounds
    }

    // Calculate the tile ID
    var tileID = rowIndex * tilesPerRow + colIndex;
    return tileID;
}

/** 아무 곳이나 클릭한, 좌표에 해당하는 타일의 원점을 재조정하여 리턴.
e.g. getTileXY(x1, y1, imageWidth, imageHeight, tileSize)
*/
function getTileXY(x1, y1, imageWidth, imageHeight, sz1) {
    // Calculate the number of tiles in a row
    var tilesPerRow = Math.ceil(imageWidth / sz1);

    // Calculate the tile's column and row indices
    var colIndex = Math.floor(x1 / sz1);
    var rowIndex = Math.floor(y1 / sz1);

    // Ensure the coordinates are within the image boundary
    if (colIndex < 0 || colIndex >= tilesPerRow || rowIndex < 0 || rowIndex >= Math.ceil(imageHeight / sz1)) {
        console.error("Coordinates are out of bounds.");
        return -1; // Return -1 if coordinates are out of bounds
    }
	// Calculate the top-left position of the tile
    var tileX = colIndex * sz1;
    var tileY = rowIndex * sz1;

    return {xx: tileX, yy: tileY};
}


/** 타일번호에 해당하는 좌표를 리턴
{x1,y1} = getTileCoords(2, width, height, sz1); 
*/
function getTileCoords(tileNumber, imageWidth, imageHeight, sz1) {
    // Calculate the number of tiles in a row
    // var tilesPerRow = Math.floor(imageWidth / sz1);
    var tilesPerRow = Math.ceil(imageWidth / sz1);	// CEIL로 해야 불완전 타일도 가져옴.
    // Calculate the x-coordinate of the tile
    var x1 = (tileNumber % tilesPerRow) * sz1;
    // Calculate the y-coordinate of the tile
    var y1 = Math.floor(tileNumber / tilesPerRow) * sz1;

    //return { x1: x1, y1: y1 };
	return {x1, y1};
}

/** 타일 번호를 주고, 타일 BR 값들을 리턴받는다.
[0,1,2,3; 8,9,10,11 ,...] = getTile(2, width, height, sz1); 
*/
function getTile(id1, width, height, sz1) {
	const {x1, y1} = getTileCoords(id1, width, height, sz1);
	var regionIndices = getImageRegionIndices(canvas, startX, startY, size);	
	
	// e.g.[0,1,2,3; 8,9,10,11 ,...]
	// 이것으로 평균을 내든, Bright 정리해든 해야...
	
}

/** n: sz1 
캔버스 이미지의 n*n 직사각형 영역에 해당하는 인덱스 배열을 출력합니다.
인덱스를 일렬 배열로 출력하여 일괄 작업에 도움을 줌.
*/
function getImageRegionIndices(canvas, x1, y1, n) {
    // Get the 2D context of the canvas
    var ctx = canvas.getContext('2d');

    // Get the actual image drawn on the canvas
    var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    var indices = [];
    
    // Boundary check
    if (x1 < 0 || y1 < 0 || x1 + n > imgData.width || y1 + n > imgData.height) {
        console.error("(x1,y1) Out of bounds");
        return []; // Return an empty array
    }
    // Loop through each row
    for (var y = y1; y < y1 + n; y++) {
        // Loop through each column
        for (var x = x1; x < x1 + n; x++) {
            // Calculate the index of the pixel in the image data array
            var index = (y * imgData.width + x) * 4;
            indices.push(index);
        }
    }

    return indices;	// e.g.[0*4,1*4,2*4,3*4; 8,9,10,11 ,...]
}

/**
사각영역이 캔버스 내의 이미지 범위를 넘는지 검사하는 함수,
임의의 x1,y1 좌표를 테스트해볼 수 있다. (canvas는 전역 쓰므로, 안 주어도 됨)

width: -100인 이유는 반드시 주어야 하기 때문.
*/
function isTileInBounds(canvas, x1, y1, sz1, width = -100) {
	// 캔버스 크기 가져오기
	var ctx = canvas2_original_bgi.getContext('2d');
	var imgData = ctx.getImageData(0, 0, canvas2_original_bgi.width, canvas2_original_bgi.height);
	//let width = imgData.width; 
	let height = imgData.height;  
	// 사각형 영역의 좌표 및 크기 계산
	const x2 = x1 + sz1;
	const y2 = y1 + sz1;
	
	// printFormat(445,"📈👣👣 이미지의 너비:{0} ", width);	// 항상 캔버스 너비를 받게 된다.
	// 범위 검사
	return (x1 >= 0 &&
	y1 >= 0 &&
	x2 <= width &&
	y2 <= height
	);
}




/** n: sz1 
[8, 12, 24, 28]과 같은 이미지의 직사각형 영역에서 픽셀 인덱스를 얻었습니다. 주어진 인덱스 배열과 주어진 캔버스에서 RGB 픽셀 값을 반환하는 함수를 작성할 수 있습니까?

결과 (text): https://pasteboard.co/pe4fDOPDfHHg.png
*/
function getPixelsFromIndices(indices, canvas) {
    const context = canvas.getContext('2d');
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = [];

    for (let i = 0; i < indices.length; i++) {
        const index = indices[i];
        const x = index % canvas.width;
        const y = Math.floor(index / canvas.width);
        
        const pixelIndex = (y * canvas.width + x) * 4;
        const r = imageData.data[pixelIndex];
        const g = imageData.data[pixelIndex + 1];
        const b = imageData.data[pixelIndex + 2];
        const a = imageData.data[pixelIndex + 3];

        pixels.push({ r, g, b, a });
    }

    return pixels;
}

function getCanvasImageIndex(canvas, eights) {
  // 캔버스 컨텍스트 가져오기
  const ctx = canvas.getContext('2d');
  // 이미지 데이터 가져오기
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // 각 좌표에 해당하는 인덱스 배열 만들기
  const indexes = eights.map((point) => {
    // 좌표 계산
    const x = Math.floor(point.x);	// eights.x를 여기서
    const y = Math.floor(point.y);	// eights = {x,y, ...any others}, ...
    // 인덱스 계산
    const index = (y * canvas.width + x) * 4;
    // 유효 범위 검사
    if (index < 0 || index >= imageData.data.length) {
      return -1;
    }

    return index;
  });

  return indexes;
}




// function getNbyNColors(canvas, x1, y1, sz1) {
// }

/** sz1*sz1 구간의 픽셀값 리턴하기 . 
e.g. 결과: [[0, 0, 255], [0, 0, 255], [0, 0, 255]]
*/
function get3x3Colors(canvas, x1, y1, sz1) {
  const context = canvas.getContext("2d");
  
  // assert("x1,y1,sz1,sz1", [x1,y1,sz1,sz1], 'number','number','number','number');
  const imageData = context.getImageData(x1, y1, sz1, sz1);


  const width = imageData.width; 
  const height = imageData.height;

  const data = imageData.data;

	
	// return null;
	
  const colors = [];
  for (let i = 0; i < 4*sz1*sz1; i += 4) {
    // Extract RGBA values as an array
	let color = [data[i], data[i + 1], data[i + 2]];
	// console.log("iter 카라:", color);
    colors.push(color);
  }
  

// console.log("색-개수:", colors.length);

  
  if (16 != colors.length) {
	  console.error("색-개수: 16아니라서 에러; ", colors.length);
  }

  return colors;
}

/** 주어진 바둑판식으로 sz1*sz1 로 배열을 출력한다
*/
function printColorsInGrid(colors, col, row) {
  for (let i = 0; i < row; i++) {
	const hor1 = [];
    for (let j = 0; j < col; j++) {
      const index = i * col + j;
      const color = colors[index];
      if (color) {
        //console.log(`Row ${i + 1}, Col ${j + 1}:`, color);
		//console.log(color);
		hor1.push(color);
      }
    }
	console.log(hor1);
  }
}



// 사각 영역의 색깔값을 비교하여 텍스트 박스에 표시한다.
function compareSquareAreaAndPrint() {
	if (-1 == kanban1) {
		console.error("칸반을 먼저 세팅하세요");
		setTextInDiv('verbose', "칸반을 먼저 세팅하세요");
		return;
	}
	const diff2 = handleAllSpanClick(kanban1*kanban1); // 사용할 SPAN TAG들을 주어야 한다.(일단 개수만 주기로)
	const under15 = (diff2 < 15) ? "15미만 🌚" : "15초과 🗙";
	const strDiff2 = diff2 + "만큼 다름. " + under15;
	
	// 이줄을 넣게 되면, 칸이 밑으로 계속 내려가게 됨 (단풍TileID 출력이 2번째 줄이 됨)
	//resetTextInDiv('verbose');
	//setTextInDiv('verbose', strDiff2);
	
	return (diff2 < 15);	// 일치여부 true/false로 리턴.
}

/** grid-container에서 Unique ID col_## 전역변수처럼 기억되어야... */
function generateGrid(nn) {
  const gridContainer = document.getElementById("grid-container");
  // 기존 그리드 내용은 지움.
  gridContainer.innerHTML = "";

  let cc = 0;
  // Create the grid
  for (let i = 0; i < nn; i++) {
    for (let j = 0; j < nn; j++) {
      const spanElement = document.createElement("span");
      cc++; // counter...카운터.
	  const uniqueID = `col_${cc}`; // Create a unique ID
      spanElement.id = uniqueID; // Set the ID for the span element
	  spanElement.innerHTML = 'E';
	  spanElement.className = 'spanco';
      gridContainer.appendChild(spanElement);
    }
    // Add a line break after each row
    const lineBreak = document.createElement("br");
    gridContainer.appendChild(lineBreak);
  }
  
  console.log(cc, "가 격자구간 COUNT");
  console.log(storage9, "가 stroage9 COUNT");
  
  //handleAllSpanClick(cc); 아직 안 함께
  compareAllStorage9();
  
}

/** 새 SPAN 생성기 
흑백나눔 버튼의 현재모양: https://postimg.cc/ykC85JFF
주어진 색깔 배열 대로 SPAN을 생성한다.(흑/백)
eg. bw1: bool array of Black or White.
*/
function generateGridMono(nn, bw1) {
  const gridContainer = document.getElementById("grid-container");
  // 기존 그리드 내용은 지움.
  gridContainer.innerHTML = "";

  let cc = 0;
  // Create the grid
  for (let i = 0; i < nn; i++) {
    for (let j = 0; j < nn; j++) {
      const spanElement = document.createElement("span");
      cc++; // counter...카운터.
	  const uniqueID = `col_${cc}`; // Create a unique ID
      spanElement.id = uniqueID; // Set the ID for the span element
	  spanElement.innerHTML = 'X';
	  spanElement.className = 'spanco';
	  // 이부분이 다름
	  spanElement.style.backgroundColor = (bw1[cc-1]) ? "#fcfcfc" : "#010101";
      gridContainer.appendChild(spanElement);
    }
    // Add a line break after each row
    const lineBreak = document.createElement("br");
    gridContainer.appendChild(lineBreak);
  }
  
 
  //handleAllSpanClick(cc); 아직 안 함께
  compareAllStorage9();
  
}


// 추가하며, 10개마다 삭제하고, 최대 비교할 개수를, 지정한다.
const maxCompare = 3;	// e.g. 2라면 최대 2개까지 비교한다.

/**
배열 내 모든 점을 비교한다 [개수를 센다]
eg. returning 15.77
*/
function compareAllStorage9() {
	let diff2 = mod.compareAllColorDifferences(storage9); /* storage9:전역 */

	if (diff2 < 15) {
		console.log("[compareAllStorage-1485]칸반 확장 추천");
	}
	
	return diff2;
}

/**
This returns the n-th minimum value in an array
const numbers = [5, 2, 8, 1, 9, 3];
const thirdSmallest = calcSmallest(arr, 3);
*/
function calcSmallest(arr, n) {
  if (n <= 0 || n > arr.length) {
    return null; // Handle invalid input
  }
  // Create a copy of the array to avoid modifying the original
  const sorted = arr.slice().sort((a, b) => a - b); // Sort in ascending order
  return sorted[n - 1]; // Access the n-th smallest value
}

/**
This returns the n-th biggest value in an array
값만 리턴한다. 인덱스를 리턴하려면 다른 함수를...
const numbers = [5, 2, 8, 1, 9, 3];
const biggest = calcBiggest(arr, 3);
*/
function calcBiggest(arr, n) {
  if (n <= 0 || n > arr.length) {
    return null; // Handle invalid input
  }
  // Create a copy of the array to avoid modifying the original
  const sorted = arr.slice().sort((a, b) => b - a); // Sort in descending order
  return sorted[n - 1]; // Access the n-th biggest value
}


/**
1) 두 지점이 겹칠 수 있는 영역을 구합니다.(yStart,End)
Q. 세로로 긴 2개의 막대가 있을 때, 1번 막대의 y 시작점과 끝점은 y1,y2이고, 2번 막대의 y 시작점과 끝점은 y3,y4입니다. 이 때 두 막대가 겹칠 수 있는 y지점의 시작과 끝을 리턴하는 자바스크립트 함수를 만들어 주세요.
*/
function getOverlapPoints(y1, y2, y3, y4) {
  // 막대가 겹치지 않는 경우
  if (y2 < y3 || y4 < y1) {
    return null;
  }

  // 겹치는 y 좌표의 시작점과 끝점을 계산
  const overlapStart = Math.max(y1, y3);
  const overlapEnd = Math.min(y2, y4);

  // 겹치는 y 좌표의 길이를 계산
  const overlapLength = overlapEnd - overlapStart;

  // 결과 객체 생성
  const result = {
    start: overlapStart,
    end: overlapEnd,
    length: overlapLength,
  };

  // 결과 객체 반환
  return result;
}

/**
숫자 배열 1개가 있습니다. 여기에서, 주어진 y1~y2 구간에 들어있는 배열 요소를 리턴하는 Javascript 함수를 만들어주세요.
*/
// function getElementsInYRange(array, y1, y2) {



// 모든 9개 점에 대하여 (비교를)누른 것처럼 시뮬레이트 한다.
function handleAllSpanClick(nn) {
  storage9 = [];	// 초기화
  // Define an array of your span IDs
  const spanIds = mod.generateColorArray(nn); // e.g. nn=4,9, or 16
  
  spanIds.forEach(function(spanId) {
    const span = document.getElementById(spanId);
    if (span) {
      const backgroundColor = window.getComputedStyle(span).backgroundColor;
      storage9.push(backgroundColor);
    } else {
      console.error(`Element With ID ${spanId} Not found.🍳🏞`);
	  console.error(kanban1);
    }
  });

  //console.log(storage9);
  if (storage9.length == 0) {
	console.error(' No ELEMENT');
  }
  //console.log(storage9);
  
  const diff2 = compareAllStorage9();
  
  return diff2;
}




// // Add an event listener to the color picker input
// colorPicker.addEventListener("input", function () {
	// font_color.value = colorPicker.value;
	// selectedHexColor = colorPicker.value;
// });
// // 색 선택 부분...


// In your JavaScript code
document.querySelector('#btnZoomIn').addEventListener('click', function() {
    g_zoomFactor *= 2;
	// 두 개의 원본 캔버스 그림을 가지고 확대하여 사본 캔버스에 넣는다
    mod.zoomCanvas(canvas2_concurrent_bgi, canvas2_original_bgi, g_zoomFactor, g_xOffset);
    mod.zoomCanvas(canvas1_concurrent_fgi, canvas1_original, g_zoomFactor, g_xOffset);
	// 사본 캔버스 2개를 합친다
    mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
});

document.querySelector('#btnZoomOut').addEventListener('click', function() {
    g_zoomFactor /= 2;
	// 두 개의 원본 캔버스 그림을 가지고 zoom하여 사본 캔버스에 넣는다
    mod.zoomCanvas(canvas2_concurrent_bgi, canvas2_original_bgi, g_zoomFactor);
    mod.zoomCanvas(canvas1_concurrent_fgi, canvas1_original, g_zoomFactor);
	// 사본 캔버스 2개를 합친다
    mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);    
    
});




// 최초 로드
document.addEventListener("DOMContentLoaded", function () {
	
    canvas1_original = document.createElement("canvas");
    canvas2_original_bgi = document.createElement("canvas");

    var copyButton = document.getElementById("copyButton");
    var pasteButton = document.getElementById("pasteButton");
	const btnAddPointRoute = document.getElementById('btnAddPointRoute');
	

	canvas_3 = document.getElementById("canvas3");
	canvas1_original.width = canvas2_original_bgi.width = canvas_3.width; 
	canvas1_original.height = canvas2_original_bgi.height = canvas_3.height; 

	// 꺾은선 그래프용
	canvasGraph = document.getElementById("canvasGraph");
	
    // 배경 '작업' 캔버스 : 확대된 캔버스는 Concurrent 붙음.
    canvas2_concurrent_bgi = mod.copyCanvas(canvas2_original_bgi);
    canvas1_concurrent_fgi = mod.copyCanvas(canvas1_original);
	
	const mouseCoordinates = document.getElementById('mouseCoordinates');
	const boxCoordinates = document.getElementById('boxCoordinates');
	

    // Add a click event listener to the copy button
    copyButton.addEventListener("click", function () {
        // Create a new canvas and context to merge the content
        var mergedCanvas = document.createElement("canvas");
        mergedCanvas.width = canvas1_original.width;// + canvas2.width;
        mergedCanvas.height = canvas1_original.height;
        var mergedContext = mergedCanvas.getContext("2d");

        // Draw the content of canvas1 and canvas2 onto the merged canvas
		mergedContext.drawImage(canvas2_original_bgi, 0, 0);	
        mergedContext.drawImage(canvas1_original, 0, 0);
		

        // Copy the merged canvas content to the clipboard
        mergedCanvas.toBlob(function (blob) {
            var item = new ClipboardItem({ "image/png": blob });
            navigator.clipboard.write([item]).then(function () {
                console.log("Canvases copied to clipboard!");
            }).catch(function (error) {
                console.error("Copy failed: ", error);
            });
        }, "image/png");
    });

	// Add a click event listener to the paste button
    pasteButton.addEventListener("click", pasteFromClipboard);
	
	btnAddPointRoute.addEventListener('click', () => {
		// RESERVED...(지점을 평균밝기 배열에 추가
		
	});


	// LeftButton, LeftClick, MouseClick : 마우스 클릭 이벤트
	canvas_3.addEventListener("click", function (event) {
		const rect = canvas_3.getBoundingClientRect();
		
		const clicked_x = event.clientX - rect.left;
		const clicked_y = event.clientY - rect.top;

		// Calculate zoomed coordinates
		const actua_x = clicked_x / g_zoomFactor;
		const actua_y = clicked_y / g_zoomFactor;
		
		const fine_x = Math.round(clicked_x / g_zoomFactor);
		const fine_y = Math.round(clicked_y / g_zoomFactor);
		
		g_act_x = fine_x;
		g_act_y = fine_y;

		//mouseCoordinates.textContent = `*** 팬전,사실좌표:(${actua_x}, ${actua_y}) | 팬후 사실좌(+-80): (${g_act_x},${g_act_y})`;// 패닝 기능은 이제 없앤 듯...
		
		// convertTextToImage(actua_x, actua_y);
        let zoomedX1 = actua_x * g_zoomFactor;
        let zoomedY1 = actua_y * g_zoomFactor;
		
		const ctx = canvas2_original_bgi.getContext('2d');
		const imgData = ctx.getImageData(0, 0, canvas2_original_bgi.width, canvas2_original_bgi.height);
		const {xx, yy} = getTileXY(g_act_x, g_act_y, imgData.width, imgData.height, kanban1);
		// 사용자에게 표시해준다. 클릭된 좌표를 표시한다.
		let txtActx = document.getElementById('actx');
		let txtActy = document.getElementById('acty');
		txtActx.value = g_act_x;
		txtActy.value = g_act_y;
		
		let tilex = document.getElementById('tile_x');
		let tiley = document.getElementById('tile_y');		
		tilex.value = xx;
		tiley.value = yy;		
		
		/** 수퍼미들값 가져온다. 꺾은 그래프에 긋기 위해 */
		const superMid1 = handleKeyAction(0,0); // 소수점 좌표 없애는 목적이 컸다.
		

		/** 바둑판 찍기: compareRegion만 한 것으로, STAIN번짐 계산 하기 전의 바둑돌값이다 */ 
		//const briger1 = printClickedRegion(g_act_x, g_act_y);	// 주의:텍스트박스 개체를 줄경우 long integer가 아니라는 에러가 남.
		printClickedRegion(g_act_x, g_act_y);	// 주의:텍스트박스 개체를 줄경우 long integer가 아니라는 에러가 남.		
		
		/** 캔버스 그래프에 4*4 꺾은선 그래프를 그리고, 이전 것도 가져와 그리기(비교) */ 
		draw2Graphs(superMid1);// briger1:매개변수는 안 주는 걸로.
		//draw2Graphs(50);// briger1:매개변수는 안 주는 걸로.
		
	});

	canvas_3.addEventListener('mousemove', (event) => {
		const rect = canvas_3.getBoundingClientRect();

        let actua_x = (event.clientX - rect.left - g_xOffset) / g_zoomFactor;
        let actua_y = (event.clientY - rect.top - g_yOffset) / g_zoomFactor;
		
		actua_x = Math.round(actua_x / g_zoomFactor);
		actua_y = Math.round(actua_y / g_zoomFactor);


		const clikaX = event.clientX - rect.left;
		const clikaY = event.clientY - rect.top;
		// Calculate zoomed coordinates
		const zoomedX = clikaX / g_zoomFactor;
		const zoomedY = clikaY / g_zoomFactor;
		
		// Display mouse coordinates
        mouseCoordinates.textContent = `Real X: ${actua_x}, Y: ${actua_y} | Clicked(Moved) X: ${clikaX}, Y:${clikaY}, Zoom:${g_zoomFactor}x `;
		
	});

	/** 버튼 누름 효과 발생시키기 Force Button Click related 'Kanban' */
	readHTMLmakeGrid();
});
 

function pasteFromClipboard() {
    // Create a new canvas and context for pasting
    var pasteCanvas = document.createElement("canvas");
    pasteCanvas.width = canvas_3.width;
    pasteCanvas.height = canvas_3.height;
    var pasteContext = pasteCanvas.getContext("2d");

    // Try to paste the clipboard image onto the paste canvas
    navigator.clipboard.read().then(function (clipboardItems) {
        clipboardItems.forEach(function (item) {
            item.getType("image/png").then(function (blob) {
                var img = new Image();
                img.src = URL.createObjectURL(blob);
				
                // Draw the pasted image onto the paste canvas
                img.onload = function () {
                    pasteContext.drawImage(img, 0, 0);

					g_imageWidth = img.width; /** 원본 너비를 알아둔다 Store Original Image Width */
					
                    // 원본 배경을 오리지널BGI에 복사함
                    canvas2_original_bgi = mod.copyCanvas(pasteCanvas);
                    // 현BGI는, 역시 오리지널과 함께 처음엔 1배줌으로 시작한다
                    canvas2_concurrent_bgi = mod.copyCanvas(pasteCanvas);
					
					mergeTriCanvases(pasteCanvas, canvas1_original, canvas_3);
                    // 원본 배경을 "불변" 오리지널BGI에 복사함
                    canvasParent = mod.copyCanvas(pasteCanvas);
                    
					console.log("Image pasted!");
                };
            });
        });
    }).catch(function (error) {
        console.error("Paste failed: ", error);
    });
}





// Function to merge two canvases onto a third canvas
// set the final canvas size to be the larger one among canvas1 and canvas2. Here's an updated version of your function to achieve that:
function mergeTriCanvases(canvas1, canvas2, destinationCanvas) {
    var ctx = destinationCanvas.getContext("2d");

    // Determine the maximum width and height among canvas1 and canvas2
    var maxWidth = Math.max(canvas1.width, canvas2.width);
    var maxHeight = Math.max(canvas1.height, canvas2.height);

    // Set the destination canvas size to the maximum dimensions
    destinationCanvas.width = maxWidth;
    destinationCanvas.height = maxHeight;

    // Clear the destination canvas
    ctx.clearRect(0, 0, destinationCanvas.width, destinationCanvas.height);

    // Draw canvas1
    ctx.drawImage(canvas1, 0, 0);

    // Draw canvas2 on top of canvas1
    ctx.drawImage(canvas2, 0, 0);
}

// Function to merge two canvases onto a third canvas 단순히 합친다.
function mergeTriCanvasesNormal(canvas1, canvas2, destinationCanvas) {
    var ctx = destinationCanvas.getContext("2d");
    
    // Clear the destination canvas
    ctx.clearRect(0, 0, destinationCanvas.width, destinationCanvas.height);

    // Draw canvas1
    ctx.drawImage(canvas1, 0, 0);

    // Draw canvas2 on top of canvas1
    ctx.drawImage(canvas2, 0, 0);
}

// 4회째 변경.ZOOMED CONCURRENT FGI에 사각형 그리기
function drawRectangleIndicator(acx, acy, col3='black') {
    var ctx = canvas1_original.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas1_original.width, canvas1_original.height);

    // Convert the canvas to a data URL
    var dataURL = canvas1_original.toDataURL("image/png");

    // Create an image element to display the image on the canvas
    var img = new Image();
    img.src = dataURL;

    // Display the image on the canvas
    img.onload = function () {
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);
        // Create a context for concurrent canvas
        var ctx_concurrent = canvas1_concurrent_fgi.getContext("2d");
		
        // Draw the rectangle on concurrent canvas
        if (-1 == kanban1) {
            console.error("칸반을 먼저 세팅하세요(N*N 격자 우선 만들기)");
        }
        const rectSize = kanban1 * g_zoomFactor; // 예: kanban1:3 이면 총 3칸
        const rectX = acx; // 마우스 찍은 곳부터...
        const rectY = acy;

        // Set the stroke color and width
        ctx_concurrent.strokeStyle = col3;
        ctx_concurrent.lineWidth = 1; // Set the stroke width

		ctx_concurrent.clearRect(0, 0, canvas1_concurrent_fgi.width, canvas1_concurrent_fgi.height);
		
        //ctx_concurrent.strokeStyle = 'brown';
        // Draw the rectangle on the concurrent canvas
        ctx_concurrent.strokeRect(rectX, rectY, rectSize, rectSize);

        // Merge canvas1 with canvas3
        mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
    };
}

/** | | | | 커튼형 라인을 그려 준다. */
function drawVLinesIndicator(acy, verticalLinesX, numTiles) {
	
    var ctx = canvas1_original.getContext("2d");
    // Clear the canvas
    ctx.clearRect(0, 0, canvas1_original.width, canvas1_original.height);

    // Convert the canvas to a data URL
    var dataURL = canvas1_original.toDataURL("image/png");

    // Create an image element to display the image on the canvas
    var img = new Image();
    img.src = dataURL;

    // Display the image on the canvas
    img.onload = function () {
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);

        // Create a context for concurrent canvas
        var ctx_concurrent = canvas1_concurrent_fgi.getContext("2d");

        // Draw the rectangle on concurrent canvas
        // if (-1 == kanban1) {
            // console.error("칸반을 먼저 세팅하세요(N*N 격자 우선 만들기)");
        // }
        const barSize = g_zoomFactor * numTiles * kanban1; // 예: 줌* 50타일*4칸
        const rectY = acy;

        // Clear the concurrent canvas
        ctx_concurrent.clearRect(0, 0, canvas1_concurrent_fgi.width, canvas1_concurrent_fgi.height);
        // Set the stroke color and width for the rectangle
        // ctx_concurrent.lineWidth = 1;
        // ctx_concurrent.strokeStyle = 'purple';
        // Draw the rectangle on the concurrent canvas
        // ctx_concurrent.strokeRect(rectX, rectY, rectSize, rectSize);

        // Draw vertical lines based on the provided x-coordinates
        ctx_concurrent.strokeStyle = '#46684C'; // Melon
        ctx_concurrent.lineWidth = 1.5;

        verticalLinesX.forEach(function (x) {
			const x2 = x*g_zoomFactor;
            ctx_concurrent.beginPath();
            ctx_concurrent.moveTo(x2, rectY); // Start the line at the specified x-coordinate and rectY
            ctx_concurrent.lineTo(x2, rectY + barSize); // Draw the line vertically down to the bottom of the rectangle
            ctx_concurrent.stroke();
        });

        // Merge canvas1 with canvas3
        mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
    };
}



/*색깔을 받도록 변경*/
function draw2RectsIndicator(acx, acy, x2,y2, col3) {
    var ctx = canvas1_original.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, canvas1_original.width, canvas1_original.height);

    // Convert the canvas to a data URL
    var dataURL = canvas1_original.toDataURL("image/png");

    // Create an image element to display the image on the canvas
    var img = new Image();
    img.src = dataURL;

    // Display the image on the canvas
    img.onload = function () {
        // Draw the image onto the canvas
        ctx.drawImage(img, 0, 0);
        // Create a context for concurrent canvas
        var ctx_concurrent = canvas1_concurrent_fgi.getContext("2d");
		//printFormat(1796,"➔FGI Width/Height ({0},{1})", canvas1_concurrent_fgi.width, canvas1_concurrent_fgi.height);
		
        // Draw the rectangle on concurrent canvas
        if (-1 == kanban1) {
            console.error("칸반을 먼저 세팅하세요(N*N 격자 우선 만들기)");
        }
        const rectSize = kanban1 * g_zoomFactor; // 예: kanban1:3 이면 총 3칸
        const rectX = acx; // 마우스 찍은 곳부터...
        const rectY = acy;
		// 깨끗이 삭제 후 사각형 그림.
		//ctx_concurrent.clearRect(0, 0, canvas1_original.width, canvas1_original.height);
		ctx_concurrent.clearRect(0, 0, canvas1_concurrent_fgi.width, canvas1_concurrent_fgi.height);
        // Set the stroke color and width
        ctx_concurrent.lineWidth = 1; // Set the stroke width
        ctx_concurrent.strokeStyle = 'brown';
        // Draw the rectangle on the concurrent canvas
        ctx_concurrent.strokeRect(rectX, rectY, rectSize, rectSize);
		ctx.strokeStyle = col3;
		ctx_concurrent.strokeRect(x2, y2, rectSize, rectSize);

        // Merge canvas1 with canvas3
        mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
    };
}



/** 2개의 사각형을 동시에 보여주었다가 마지막에 1개(Old)를 없앤다. */
function drawIndicator3Times(acx, acy, x2,y2) {
    // 호출 간격을 조절하기 위한 변수
    const interval = 480; // 각 호출 간격 (ms)
    // 첫 번째 호출
    //drawRectangleIndicator(acx, acy, 'green');
	draw2RectsIndicator(acx, acy, x2,y2, 'green');
    // setTimeout을 이용해 나머지 호출을 예약
    setTimeout(function() {
        // 두 번째 호출
		draw2RectsIndicator(acx, acy, x2,y2, 'lightgreen');
    }, interval);

    setTimeout(function() {
        // 세 번째 호출
        drawRectangleIndicator(acx, acy, 'red');
    }, interval * 2);
}


// 주어진 DIV 태그의 내용을 넣는다

/*
이 함수의 작성 요청과 GPT설명
https://postimg.cc/tZtGRxHg
*/
function setTextInDiv(divId, text) {
  const targetDiv = document.getElementById(divId);

  if (targetDiv) {
    targetDiv.innerHTML += text + "<br>";
  } else {
    console.error(`Div with ID '${divId}' not found.`);
  }
}
/*
줄 삭제로 새로 쓰기 (매번 한줄이 됨) 
*/
function setNewTextInDiv(divId, text) {
  const targetDiv = document.getElementById(divId);

  if (targetDiv) {
	targetDiv.textContent = "";	  // 비우기 위하여 리셋 한다.
    targetDiv.innerHTML += text + "<br>";
  } else {
    console.error(`Div with ID '${divId}' not found.`);
  }
}

// 랜덤 색깔 주면서 문구 표시
function setColorTextInDiv(divId, text, col1) {
  const targetDiv = document.getElementById(divId);

  if (targetDiv) {
	targetDiv.style.color = col1;
    targetDiv.innerHTML += text + "<br>";
  } else {
    console.error(`Div with ID '${divId}' not found.`);
  }
}

// DIV에 지우면서 새로 '안' 넣기
function resetTextInDiv(divId) {
  const targetDiv = document.getElementById(divId);

  if (targetDiv) {
    targetDiv.textContent = "";
  } else {
    console.error(`Div with ID '${divId}' not found.`);
  }
}

// combines them into a single string
function strFormat(string, ...variables) {
    let result = string;
    for (let i = 0; i < variables.length; i++) {
        result = result.replace(`{${i}}`, variables[i]);
    }
	
    return result;
}

function strFormat2(string, ...variables) {	//COLOR_TEXT
    let result = string;
    for (let i = 0; i < variables.length; i++) {
        result = result.replace(`{${i}}`, variables[i]);
    }

	const result2 = [`%c${result}`, 'color: red'];
    return result2;
}

/***
다음의 간소화
e.g. console.log(...strFormat2("Id_{0}:{1}_to_{2}↑", id1, y1, y00));
*/
function printFormat(num, string, ...variables) {	//COLOR_TEXT
    let result = string;
    for (let i = 0; i < variables.length; i++) {
        result = result.replace(`{${i}}`, variables[i]);
    }

	//const dic1 = {0:'#b9EFa5', 1:'#9E1C00', 2:'cyan', 3:'blue' };
	const dic1 = {0:'#b9EFa5', 1:'#9E2C00', 2:'cyan', 3:'#C491E9' };
	const col1 = dic1[num % 4];
	const result2 = [`%c${result}  :${num}`, 'color: '+col1];
	console.log(...result2);
    //#C491E9
	const result3 = `${result}`;
	return result3;
	// return (...result2);
}


// 중복 항목을 배열서 제거
// e.g. const myArray = [1, 1, 2, 2, 3, 4, 4, 5, 6];
function removeDuplicateItems(arr) {
  return [...new Set(arr)];
}

// 특정 값이 n번째로 나타나는 인덱스를 찾는 예제 (사용 안함)
function findNthIndex(array, value, n) {
  // 1. 초기값 설정
  let count = 0;
  let index = -1;
  // 2. 배열을 순회하며 특정 값을 찾습니다.
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) {
      // 3. n번째 값을 찾았을 경우 인덱스를 저장합니다.
      if (count === n) {
        index = i;
        break;
      }
      count++;
    }
  }
  // 4. n번째 값을 찾지 못했을 경우 -1을 반환합니다.
  return index;
}




/**
	오름/내림차순으로 value가 들어갈 수 있는 인덱스 리턴.
	(arr, value, 오름(T), 내림(F))
*/
function getVirtualIndex(arr, value, ascending) {
    /**
     * Finds the index where the given value would be placed in a sorted array.
     * 
     * @param {Array} arr - A sorted array.
     * @param {*} value - The value for which the virtual index is to be found.
     * @param {boolean} ascending - Indicates whether the array is sorted in ascending order (true by default).
     * @returns {number} - The index where the value would be placed in the sorted array.
     */
    
    // Edge case: If the array is empty, the virtual index would be 0.
    if (arr.length === 0) {
        return 0;
    }
    
    // Binary search to find the index
    let left = 0;
    let right = arr.length - 1;
    
    while (left <= right) {
        let mid = Math.floor((left + right) / 2);
        if (arr[mid] === value) {
            return mid;
        } else if ((arr[mid] < value && ascending) || (arr[mid] > value && !ascending)) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }
    
    // At this point, the value is not in the array
    // If the array is sorted in ascending order
    if (ascending) {
        // If the value is less than the element at left, it should be inserted at left
        if (value < arr[left]) {
            return left;
        } else { // If the value is greater than the element at right, it should be inserted after right
            return right + 1;
        }
    } else { // If the array is sorted in descending order
        // If the value is greater than the element at left, it should be inserted at left
        if (value > arr[left]) {
            return left;
        } else { // If the value is less than the element at right, it should be inserted after right
            return right + 1;
        }
    }
}



/**
 화살표키 대응. 또한 마우스클릭으로 좌표가 결정됐다면, 계산을 해보고, 소수점을 없앤다.
 handleKeyAction() 과 비슷함. 절대좌표.
 ☎ 전역변수를 업데이트 함.
*/
function handleKeyAbsolute(abx, aby, x2, y2) {
    const actua_x = (abx) + g_xOffset;
    const actua_y = (aby) + g_yOffset;
	
    const actua_x2 = (x2);// + g_xOffset;
    const actua_y2 = (y2);// + g_yOffset;	

	g_act_x = (abx);	// 전역변수 업데이트
	g_act_y = (aby);	// 위치 전역변수 업데이트

    mouseCoordinates.textContent = `*** Handling:Real좌표g_act ${g_act_x},Y: ${g_act_y}  `;

    let zoomedX1 = actua_x * g_zoomFactor;
    let zoomedY1 = actua_y * g_zoomFactor;
    let zoomX2 = actua_x2 * g_zoomFactor;
    let zoomY2 = actua_y2 * g_zoomFactor;

	drawIndicator3Times(zoomedX1, zoomedY1, zoomX2, zoomY2);

    // 9픽셀 보여주기 (16개의 Span 태그에)
    const colors16 = mod.getPixelColorsFromCanvasNN(g_act_x, g_act_y, canvas2_original_bgi, kanban1);
    const spanIds = mod.generateColorArray(kanban1 * kanban1);

    mod.fillSpansBGColors(spanIds, colors16);

	// VERBOSE 색깔차도 표시해 준다.
	const simCol = compareSquareAreaAndPrint();
  
	/** 키보드 이동시에도, 현 지점 바둑돌 무조건 표시 */
	const superMid1 = printClickedRegion(g_act_x, g_act_y);
	
	return superMid1;
}

/**
 화살표키 대응. 또한 마우스클릭으로 좌표가 결정됐다면, 계산을 해보고, 소수점을 없앤다.
*/
function handleKeyAction(directionX, directionY) {
    const actua_x = (g_act_x + directionX) + g_xOffset;
    const actua_y = (g_act_y + directionY) + g_yOffset;
	
	g_act_x = (g_act_x + directionX);	// 전역변수 업데이트
	g_act_y = (g_act_y + directionY);	// 위치 전역변수 업데이트
	
    mouseCoordinates.textContent = `*** Handling:Real좌표g_act ${g_act_x},Y: ${g_act_y}  `;
	boxCoordinates.textContent = `[핸들] 박스 좌표 ${g_act_x},Y: ${g_act_y}  `;

    let zoomedX1 = actua_x * g_zoomFactor;
    let zoomedY1 = actua_y * g_zoomFactor;
    drawRectangleIndicator(zoomedX1, zoomedY1, 'black');

    // 9픽셀 보여주기 (16개의 Span 태그에)
    const colors16 = mod.getPixelColorsFromCanvasNN(g_act_x, g_act_y, canvas2_original_bgi, kanban1);
    const spanIds = mod.generateColorArray(kanban1 * kanban1);

    mod.fillSpansBGColors(spanIds, colors16);
    //console.log(spanIds, colors16);
	
	// VERBOSE 색깔차도 표시해 준다.
	const simCol = compareSquareAreaAndPrint();
	

	/** 키보드 이동시에도, 현 지점 바둑돌 무조건 표시 */
	const superMid1 = printClickedRegion(g_act_x, g_act_y);
	
	return superMid1;
	
	/** 클립보드에 카피 하지도 않고, 일단 안 기록. 안찍기로 함. */	
}



	
// Add a CTRL+V keyboard shortcut to trigger the paste button
document.addEventListener("keydown", function (event) {
	if (event.ctrlKey && event.key === "v") {
		event.preventDefault(); // Prevent the default paste behavior
		pasteFromClipboard();
	} else if (event.key === "+") {
        g_zoomFactor *= 2;

        mod.zoomCanvas(canvas2_concurrent_bgi, canvas2_original_bgi, g_zoomFactor);
        mod.zoomCanvas(canvas1_concurrent_fgi, canvas1_original, g_zoomFactor);

        canvas2_concurrent_bgi = mod.redrawCanvasWithOffsets(canvas2_concurrent_bgi, g_xOffset);
        canvas1_concurrent_fgi = mod.redrawCanvasWithOffsets(canvas1_concurrent_fgi, g_xOffset);

        mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
		
		handleKeyAction(0,0);	// 사각형을 제자리에 다시 그림.
		drawBlurLines(g_imageWidth, g_act_y, 80);
    } else if (event.key === "-") {
        g_zoomFactor /= 2;

        mod.zoomCanvas(canvas2_concurrent_bgi, canvas2_original_bgi, g_zoomFactor);
        mod.zoomCanvas(canvas1_concurrent_fgi, canvas1_original, g_zoomFactor);

        canvas2_concurrent_bgi = mod.redrawCanvasWithOffsets(canvas2_concurrent_bgi, g_xOffset);
        canvas1_concurrent_fgi = mod.redrawCanvasWithOffsets(canvas1_concurrent_fgi, g_xOffset);

        mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
		
		handleKeyAction(0,0);	// 사각형을 제자리에 다시 그림.
		
		// 체크 블러 안하고 커튼만 그림
		drawBlurLines(g_imageWidth, g_act_y, 80);
    } else if (event.key === "z") {
		// Panning
        g_xOffset -= 80;

        mod.zoomCanvas(canvas2_concurrent_bgi, canvas2_original_bgi, g_zoomFactor);
        mod.zoomCanvas(canvas1_concurrent_fgi, canvas1_original, g_zoomFactor);

        canvas2_concurrent_bgi = mod.redrawCanvasWithOffsets(canvas2_concurrent_bgi, g_xOffset);
        canvas1_concurrent_fgi = mod.redrawCanvasWithOffsets(canvas1_concurrent_fgi, g_xOffset);

        mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
    } else if (event.key === "x") {
		// Panning
        g_xOffset += 80;
        
        mod.zoomCanvas(canvas2_concurrent_bgi, canvas2_original_bgi, g_zoomFactor);
        mod.zoomCanvas(canvas1_concurrent_fgi, canvas1_original, g_zoomFactor);

        canvas2_concurrent_bgi = mod.redrawCanvasWithOffsets(canvas2_concurrent_bgi, g_xOffset);
        canvas1_concurrent_fgi = mod.redrawCanvasWithOffsets(canvas1_concurrent_fgi, g_xOffset);

        mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
	} else if (event.key === 'i') {
		const superMid1 = handleKeyAction(0,-1);
    } else if (event.key === 'k') {
		const superMid1 = handleKeyAction(0,1);
    } else if (event.key === 'l') { // L은 4칸이다 (2*2).
		const superMid1 = handleKeyAction(1,0);
    } else if (event.key === 'j') { // M은 16칸이다 (4*4).
		const superMid1 = handleKeyAction(-1,0);
    } else if (event.key === '\\') { // M은 16칸이다 (4*4).		
		const superMid1 = handleKeyAction(0,0);	//
    } else if (event.key === 'g' || event.key === 'o') { // 제자리 차이점
		const ctx = canvas2_original_bgi.getContext('2d');
		const imgData = ctx.getImageData(0, 0, canvas2_original_bgi.width, canvas2_original_bgi.height);
		const {xx, yy} = getTileXY(g_act_x, g_act_y, imgData.width, imgData.height, kanban1);
		const superMid1 = handleKeyAbsolute(xx,yy, g_act_x, g_act_y); //⚽이 함수는 전역 x,y를 바꾼다.
		
		//const superMid1 = handleKeyAction(0,0); 
		draw2Graphs(superMid1);

		/** 殘(잔상) 더하기 */
		//g_witness.push(superMid1); // 殘(잔상)
	} else if (event.key === 'w') {
		const superMid1 = handleKeyAction(0,-kanban1); 
		draw2Graphs(superMid1); /** ADDING WITNESS ALSO */
		// g_witness.push(superMid1); // 殘(잔상)
    } else if (event.key === 's') {
		const superMid1 = handleKeyAction(0,kanban1);
		draw2Graphs(superMid1);
		// addWitness(g_witness, xx, yy, superMid1); // true
    } else if (event.key === 'a') { // L은 4칸이다 (2*2).
		const superMid1 = handleKeyAction(-kanban1,0);
		draw2Graphs(superMid1);
		// addWitness(g_witness, xx, yy, superMid1); // true
    } else if (event.key === 'd') { // M은 16칸이다 (4*4).
		const superMid1 = handleKeyAction(kanban1,0);
		draw2Graphs(superMid1);
		// addWitness(g_witness, xx, yy, superMid1); // true
    } else if (event.key === 'e') { /** 흐린 부분인지 확인, 여러 개씩. 多雲的? */
		const cntBlur = getEightVerticalBlocks(g_act_x, g_act_y, 50);
		const c2 = getEightVerticalBlocks(g_act_x+50, g_act_y, 50);
		const c3 = getEightVerticalBlocks(g_act_x+100, g_act_y, 50);
		const c4 = getEightVerticalBlocks(g_act_x+150, g_act_y, 50);
		const c5 = getEightVerticalBlocks(g_act_x+200, g_act_y, 50);
		
		setNewTextInDiv('verbose', `☁🌧🍁(흐린부분 개수:${cntBlur},${c2},${c3},${c4},${c5})`, getRandomColor());
	} else if (event.key === 'g') { /** GRAPH그리기 雲 */		
		//const superMid1 = handleKeyAction(0,0); // 소수점 좌표 없애는 목적이 컸다.	
		/** 수퍼미들값은 핸들키다운함수가 아니라 아래 함수서 오는 것 
		r key, g key 번갈아 사용시, 화면의 가이드가 지워져서 다신 표시되지 않는 문제 있음.
		*/
		const superMid1 = printClickedRegion(g_act_x, g_act_y);
		draw2Graphs(superMid1);
		
    } else if (event.key === 't') { /** Q-E-R 흐린 부분인지 확인, 전체 페이지 자동 雲 */
		g_imageIdx++;
		loadNewImage(canvas2_original_bgi, g_imageIdx);
		const bBlur = chkBlurry(g_imageWidth, g_act_y, 50); // 50 tiles to vertical.
    } else if (event.key === 'r') { /** Q-E-R 흐린 부분인지 확인, 전체 페이지 자동 雲 */

		let canvas4 = createCanvasFromImage(g_images[0]);
		let width4 = g_images[0].width;
		const [bBlur, blurs] = chkBlurryVirtual(g_imageWidth, g_act_y, 80, canvas4, width4); // 50 	
	
		// 아래 루틴을 쓰면, CTRL_V한 것을 탐색한다. (위의 코드는 CTRL_V된 것은 탐색 못한다)
		// const bBlur = chkBlurry(g_imageWidth, g_act_y, g_numTiles); // 50~80 tiles 세로로.
		
		// 체크 블러 안하고 커튼만 그림(그래프 안나옴)
		drawBlurLines(g_imageWidth, g_act_y, 80);
		
		/** 크리스퍼를 저장 및 비교함 */
		//g_images[0], numTiles, (canvas4, width4)
		g_crisper = getCrisperVirtual(g_act_y, 20, canvas4, width4);//색인값은 길 필요 없다

		printFormat(2451,"이 이미지 흐린가? {0}", bBlur);
		printFormat(2451,"색인값 {0}", g_crisper);
		// console.log(g_crisper);
		
		// ----------------------------------------------------
    } else if (event.key === 'q') { /** 흐린 부분인지 확인, 1개씩. 多雲的? */
		const qty3 = 6;
		//const wit1 = g_witness.slice(g_witness.length - 3); // recent wit 3개.
		const wit1 = g_witness.slice(g_witness.length - qty3); // recent wit 3개.
		
		if (wit1.length >= qty3) {	// 연속된 블럭을 검사하여야 함.
			const lastElem = wit1.at(-1); // lastElem = 구 wit1[2].

			const minE = 140;
			const maxE = 230;
			
			const print1 = printFormat(2291,"자취 수퍼mid값:{0}, 범위(실{1}~{2}/허용{4}~{5}) 전체의Count:{3}", lastElem.mid, lastElem.min0, lastElem.max0, wit1.length, minE, maxE);
			
			setNewTextInDiv('verbose', `🍁(${print1})`, getRandomColor());			
			let bBlurs = evaluateBlocks(wit1, minE, maxE);
			
		} else if (wit1.length > 0) {
			const lastElem = wit1.at(-1); 
			const minE = 140;
			const maxE = 230;
			
			const print1 = printFormat(2295,"자취 수퍼mid값:{0}, 범위(실{1}~{2}/허용{4}~{5}) 전체의Count:{3}", lastElem.mid, lastElem.min0, lastElem.max0, wit1.length, minE, maxE);
			
			setNewTextInDiv('verbose', `🍁(${print1})`, getRandomColor());
			
		} else {
			setNewTextInDiv('verbose', `🍁First Q`, getRandomColor());
		}
		
		
	} else if (event.key === "F1") {	/** BRIGHT 추출용 */
		event.preventDefault();
		const superMiddle1 = compareRegion(); // 완전 결정난 경계값을 리턴한다.
		processRegion(superMiddle1);	// 표시해본다
		
		fillImageWithMonochromeColor(canvas2_original_bgi, superMiddle1);

    } else if (event.key === "F2") {
		/** 현 지점을 복구하라 */
		//canvas2_original_bgi = mod.copyCanvas(canvasParent); // 캔버스 전체 복구.
		
		// 캔버스 부분 복구(불변 Parent에서 영역을 가져옴)
		copyRegion(canvasParent, canvas2_original_bgi, g_act_x, g_act_y, kanban1,kanban1);
		// // ZOOM 완료된 것을 다시 그린다.
		redrawCurrentCanvas();
		
    } else if (event.key === "F3") {
		event.preventDefault();

		/** actx, acty를 바꾸어 놓아라..
		actx,y를 주면, tile ID 에 해당하는, XY를 돌려주어야 한다
		*/
		const ctx = canvas2_original_bgi.getContext('2d');
		const imgData = ctx.getImageData(0, 0, canvas2_original_bgi.width, canvas2_original_bgi.height);
		const {xx, yy} = getTileXY(g_act_x, g_act_y, imgData.width, imgData.height, kanban1);
		printClickedRegion(xx, yy);	/** gactxy대신,타일 위치의 시작점으로 가서 구함*/
		
		// const superMiddles = getAllSuperMids(150); // 완전 결정난 경계값을 리턴한다.
		// //---> processRegions!! 로 만들어야(superMiddle1);	// 표시해본다
		// console.log(superMiddles);	// 펼칠 수 있는 출력
		// // console.log(strFormat("수퍼 미들스 배열: {0} ", superMiddles));// 나열식 배열 출력
		

		// for (let i=0; i<superMiddles.length; i++) {
			// fillTileWithMono(canvas2_original_bgi, i, superMiddles[i]);			
		// }

		
    } else if (event.key === "F4") {
		
		// 바둑돌만 표시하겠다.(아래2는 processRegion(1함수의 일부이다)
		if (g_act_x != undefined && g_act_y != undefined) {	// CLICKED?
		
			/** actx, acty를 바꾸어 놓아라..
			actx,y를 주면, tile ID 에 해당하는, XY를 돌려주어야 한다
			*/
			const ctx = canvas2_original_bgi.getContext('2d');
			const imgData = ctx.getImageData(0, 0, canvas2_original_bgi.width, canvas2_original_bgi.height);
			const {xx, yy} = getTileXY(g_act_x, g_act_y, imgData.width, imgData.height, kanban1);
			printClickedRegion(xx, yy);	/** gactxy대신,타일 위치의 시작점으로 가서 구함*/
			
			
			// 박스 좌표 업데이트하기(**현재 4*4의 E 그림은 변하지 않음. 수동으로 이동해야..)
			boxCoordinates.textContent = `***F4로 박스 좌표 ${xx},Y: ${yy}  `;
			/** 그래서 실제로 사각박스도 없앤다 */
			
			const id1 = getTileID(g_act_x, g_act_y, imgData.width, imgData.height, kanban1);
			//아래는 중복인데...
			//const {x1, y1} = getTileCoords(id1, imgData.width, imgData.height, kanban1);
			
			// console.log("타일ID",id1); // EIGHT함수에서 출력하는 게 낫다.
			//const eights = getEightSuperMids(id1);
			//console.log("eight mids", eights);

			/** coordi {x: tileOri.x, y: tileOri.y, mid: superMid1 
			200/4 = 50.
			*/
			const eights = getEightCliffs(id1, 200/4);	// e.g. eights = [154, 174];
			//const eights11 = getEightCliffs(id1+1, 200/4);	// 우측 1컬럼도.
			
			handleKeyAbsolute(xx,yy, g_act_x, g_act_y); //⚽이 함수는 전역 x,y를 바꾼다.
			
			
			//console.log("📤(일부분2개)of 8 mids", eights);
			printFormat(2258,"Tile始({0},{1}) 수퍼 중간값: {2}", eights[0].x, eights[0].y, eights[0].mid);
			//console.log("📤(일부분2개)of 8 mids", eights[0].x);
			console.log("📤(일부분2개)of 8밑 mids", eights);
			
			//이것이 만큼다름.
			setNewTextInDiv('verbose', `🍁Tile ID:(${id1})`, getRandomColor());
			
			const eights2 = extractMidValues(eights);	// [스칼라 배열을 가져옴]
			const stained1 = stainBlackValues(eights2);	// spread black values.
			printFormat(2258,"STAINED点点({0}) 조정된 중간값들", stained1);
			console.log(stained1);
			
			/** 모노크롬으로 변환을 한다 eights.x에, g_act_x대입해야... */
			for (let i=0; i<eights.length; i++) {
				//fillTileXY_WithMono(canvas2_original_bgi, eights[i].x, eights[i].y, eights2[i]);
				fillTileXY_WithMono(canvas2_original_bgi, eights[i].x, eights[i].y, stained1[i]);
			}
			// fillTileXY_WithMono(canvas2_original_bgi, eights[0].x, eights[0].y, eights2[0]);
			// fillTileXY_WithMono(canvas2_original_bgi, eights[1].x, eights[1].y, eights2[1]);
			
			
			// // ZOOM 완료된 것을 다시 그린다.(REFRESH)
			redrawCurrentCanvas();
			
			/** 한줄 더 */
			//const eightsB = getEightCliffs(id1, 200/4);	// e.g. eights = [154, 174];
			
			
			/** 캔버스내 이미지 인덱스를 모아서 일괄처리 하려고 구함. */
			const indices = getCanvasImageIndex(canvas2_original_bgi, eights);//... (eights' xy. to image index.)
			getPixelsFromIndices(indices, canvas2_original_bgi);
			
			/** 2개의 꺾은선 그래프 그려줌. 아직... */		
			//draw2Graphs(); //  mid1을 파라메터로 넣어주어야...아직 안넣음
		} else {
			setColorTextInDiv('verbose', `클릭되지않음: (${g_act_x},${g_act_y})`, getRandomColor());
		}
    }	// END OF 'F4' LISTENING.
});


// 미리 정해진 색 6개 중 하나를 리턴한다.
function getRandomColor() {
   const currentTime = new Date();
   let seconds = currentTime.getSeconds();
   
   const colorArray = ["#f0dede", "#deffde", "#dedeff", "#e09090", "#90e090", "#808010"]; // 5가지 색들
   let ii = (seconds % 6);
   
   // console.log('랜덤색',colorArray[ii]);
   
   return colorArray[ii];
}

/** ZOOM 완료된 것을 다시 그린다 */
function redrawCurrentCanvas() {
	mod.zoomCanvas(canvas2_concurrent_bgi, canvas2_original_bgi, g_zoomFactor);
	mod.zoomCanvas(canvas1_concurrent_fgi, canvas1_original, g_zoomFactor);

	canvas2_concurrent_bgi = mod.redrawCanvasWithOffsets(canvas2_concurrent_bgi, g_xOffset);
	canvas1_concurrent_fgi = mod.redrawCanvasWithOffsets(canvas1_concurrent_fgi, g_xOffset);
	mergeTriCanvases(canvas2_concurrent_bgi, canvas1_concurrent_fgi, canvas_3);
}


/**
The createCanvasFromImage function takes an image object (an instance of Image) as input.
이미지에서 캔버스 만들기
*/
function createCanvasFromImage(image) {
  // Create a new canvas element
  const canvas = document.createElement('canvas');

  // Set the canvas dimensions based on the image size
  canvas.width = image.width;
  canvas.height = image.height;

  // Get the 2d drawing context of the canvas
  const ctx = canvas.getContext('2d');

  // Draw the image onto the canvas
  ctx.drawImage(image, 0, 0);

  // Return the newly created canvas
  return canvas;
}

/** 캔버스의 이미지를 새 이미지로 바꾼다 
전역변수 g_images 사용.
4*4 픽셀 검사를, canvas2 실제 캔버스에서 하기 때문에, 아래 함수 만으로는 안됨.
*/
function loadNewImageVirtual(canvasX, idx) {
	//let canvasX = canvas2_original_bgi;
	// Get the first image
	var firstImage = g_images[idx];
	// Get the context of canvasX
	var canvasXContext = canvasX.getContext('2d');

	// Set the size of canvasX to match the size of the first image
	canvasX.width = firstImage.width;
	canvasX.height = firstImage.height;
	// Copy the first image onto canvasX
	canvasXContext.drawImage(firstImage, 0, 0);
	// handleKeyAction(0,0);

	/**-----------------PASTE IMAGE 출력(표시 부 가져옴)----------*/
	g_imageWidth = firstImage.width; /** 원본 너비를 알아둔다 Width */
	// 원본 배경을 오리지널BGI에 복사함
	canvas2_original_bgi = mod.copyCanvas(canvasX);
	// 현BGI는, 역시 오리지널과 함께 처음엔 1배줌으로 시작한다
	canvas2_concurrent_bgi = mod.copyCanvas(canvasX);
	
	/**-----------REDRAW canvas2의 이름을 가진 2개만 업데이트돼 있으면 된다.----------*/
	//redrawCurrentCanvas();	
	/**-----------------REDRAW ----------*/
	//mergeTriCanvases(canvasX, canvas1_original, canvas_3);
	// 원본 배경을 "불변" 오리지널BGI에 복사함
	canvasParent = mod.copyCanvas(canvasX);
	console.log("Image pasted AS PARENT!");

	// Print a message indicating that the first image has been copied
	// console.log("First image copied to canvasX");
}

/** 캔버스의 이미지를 새 이미지로 바꾼다 
전역변수 g_images 사용.
*/
function loadNewImage(canvasX, idx) {
	//let canvasX = canvas2_original_bgi;
	// Get the first image
	var firstImage = g_images[idx];
	// Get the context of canvasX
	var canvasXContext = canvasX.getContext('2d');

	// Set the size of canvasX to match the size of the first image
	canvasX.width = firstImage.width;
	canvasX.height = firstImage.height;
	// Copy the first image onto canvasX
	canvasXContext.drawImage(firstImage, 0, 0);
	// handleKeyAction(0,0);

	/**-----------------PASTE IMAGE 출력(표시 부 가져옴)----------*/
	g_imageWidth = firstImage.width; /** 원본 너비를 알아둔다 Width */
	// 원본 배경을 오리지널BGI에 복사함
	canvas2_original_bgi = mod.copyCanvas(canvasX);
	// 현BGI는, 역시 오리지널과 함께 처음엔 1배줌으로 시작한다
	canvas2_concurrent_bgi = mod.copyCanvas(canvasX);
	
	/**-----------REDRAW canvas2의 이름을 가진 2개만 업데이트돼 있으면 된다.----------*/
	redrawCurrentCanvas();	
	/**-----------------REDRAW ----------*/
	//mergeTriCanvases(canvasX, canvas1_original, canvas_3);
	// 원본 배경을 "불변" 오리지널BGI에 복사함
	canvasParent = mod.copyCanvas(canvasX);
	console.log("Image pasted AS PARENT!");

	// Print a message indicating that the first image has been copied
	// console.log("First image copied to canvasX");
}


/**  (x1,y1,width,height)를 수신하여 소스 캔버스의 영역을 대상 캔버스로 복사하는 함수 */
function copyRegion(sourceCanvas, targetCanvas, x1, y1, width, height) {
    // Get the 2D rendering contexts of the source and target canvases
    var sourceCtx = sourceCanvas.getContext('2d');
    var targetCtx = targetCanvas.getContext('2d');
    
    // Draw the specified region from the source canvas to the target canvas
    targetCtx.drawImage(sourceCanvas, x1, y1, width, height, x1, y1, width, height);
}


function copyCanvasToClipboard(canvas) {
    // Convert canvas content to data URL
    var dataURL = canvas.toDataURL("image/png");

    // Create a blob from the data URL
    var blob = dataURItoBlob(dataURL);

    // Use the Clipboard API to copy the blob
    navigator.clipboard.write([
        new ClipboardItem({
            [blob.type]: blob
        })
    ]);

    // You can also handle success or error events if needed
}

function copyTextToClipboard(txt) {
	navigator.clipboard.writeText(txt)
		.then(() => {
		  console.log('Text copied to clipboard!');
		})
		.catch(err => {
		  console.error('Failed to copy text:', err);
		});
}

function dataURItoBlob(dataURI) {
    // Convert base64/URLEncoded data component to raw binary data
    var byteString;
    if (dataURI.split(",")[0].indexOf("base64") >= 0)
        byteString = atob(dataURI.split(",")[1]);
    else byteString = unescape(dataURI.split(",")[1]);

    // Separate out the mime component
    var mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];

    // Write the bytes of the string to an ArrayBuffer
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    // Create a Blob from the ArrayBuffer
    return new Blob([ab], { type: mimeString });
}



// 새 캔버스를 기존 캔버스 비슷하게 만든다
function createCanvasLikeExisting(existingCanvas) {
    // Create a new canvas element
    var newCanvas = document.createElement("canvas");

    // Set the width and height of the new canvas based on the existing canvas
    newCanvas.width = existingCanvas.width;
    newCanvas.height = existingCanvas.height;

    // Return the newly created canvas
    return newCanvas;
}

// Example usage:
// var existingCanvas = document.getElementById("yourExistingCanvasId");
// var newCanvas = createCanvasLikeExisting(existingCanvas);

/** 3개를 리턴한다. */
// function getWitness(arr) {
	// const mids = getAllMids(arr);	
	// const min1 = Math.min(...mids);
	// const max1 = Math.max(...mids);
	// console.log(min1, max1); // [3, 5]

	// const recentMids = arr.slice(arr.length - 3);	
	
	// return recentMids;
// }
/** addCoordniate: add Witness. 

brSorted1: 16개의 좌표이다.
arrWit: g_witness에 넣어준다.
$$addWitness
*/
function addWitness(brSorted1, arrWit, x1, y1, mid1) {
  // 좌표 유효성 검사
  if (!isValidCoordinate(x1, y1)) { // 정수인가?
    return false;
  }

  // 배열에 같은 좌표가 있는지 검사
  if (arrWit.some((coordinate) => coordinate.x === x1 && coordinate.y === y1)) {
	  if (x1 >= 0 && y1 >=0) { // -1,-1경우엔 중복 좌표 검사 않는다.
		printFormat(2526, "동좌표있음 {0},{1}", x1,y1);
	    return false;
	  }
	  // printFormat(2530, "동좌표있으나 음수 {0},{1}", x1,y1);
  }

	// Min and Max를 만들어서 넣어야 함. ***
	const min1 = Math.min(...brSorted1);
	const max1 = Math.max(...brSorted1);

  // 새로운 좌표 객체 생성
  const newWit = {
    x:x1, y:y1, mid:mid1,
	min0:min1, max0:max1
  };

	printFormat(2530, "동좌표 없고 {0},{1}", x1,y1);
	
  // 배열에 좌표 추가
  arrWit.push(newWit);

  return true;
}
// 좌표 유효성 검사 함수
function isValidCoordinate(x, y) {
  return Number.isInteger(x) && Number.isInteger(y);
}


/** 타일 모음이 흐린 지 리턴 (mid1 모음으로 판단) 
SPACE-SPACE-SPACE-BLUR-BLUR-BLUR 이면, 블러리 입니다.
파라메터는 전역 변수 ***/
// function areBlurry(from1, to1) {
	// const mids = getAllMids(g_witness); /** G_WITNESS 사용 함. °°°°°*/
	
	// const min1 = Math.min(...mids);
	// const max1 = Math.max(...mids);
	
	// console.log(min1, max1); // [3, 5]

	// if (min1 > from1 && max1 < to1) {
		// printFormat(2555,"[블러리]🌲🌲🌲多雲的MidVals({1}~{2}) fulfills {3}~{4}", min1, max1, from1, to1);
		// return true;
	// }
	// printFormat(2555,"[블러리]💠PUNC또는WHITE的({1}~{2}) 불만족:{3}~{4}", min1, max1, from1, to1);
	// return false;
// }
function isTileSpace() {
}
/** 한 타일의 값들을 모두 받아서... 그래서 min max, 값을 여기서 별도로 구한다. 그래서 이 함수를 부르기 전에 구할 필요가 없다. .
그리고 true하기에 수용 가능한 from,to 구간을 알려주면, 받은 타일이 만족하는 지를 리턴할 것이다. 
from1,to1 : 상수들, 사용자가 원하는...
***/
function isTileBlurry(arr, from1, to1) {
	const min1 = Math.min(...arr);
	const max1 = Math.max(...arr);
	// console.log(min1, max1); // [3, 5]

	if (min1 > from1 && max1 < to1) {
		printFormat(2555,"[블러?Yes]🌲🌲🌲多雲的MidVals({1}~{2}) fulfills {3}~{4}", min1, max1, from1, to1);
		return true;
	}
	printFormat(2555,"[블러?Nay]💠PUNC또는WHITE的({1}~{2}) 불만족:{3}~{4}", min1, max1, from1, to1);
	return false;	
}

function isTileMMMBlurry(min1, max1, from1, to1) {
	if (arguments.length !== 4) {
		console.error('잘못된 개수의 인수가 전달되었습니다.');
		alert('ERROR');
		return;
	}
	
	if (min1 > from1 && max1 < to1) {
		// printFormat(2618,"[단수MMM블러?Yes]🌲🌲🌲多雲的MidVals({1}~{2}) fulfills {3}~{4}", min1, max1, from1, to1);
		return true;
	}
	// printFormat(2618,"[단수MMM블러?Nay]💠PUNC또는WHITE的({1}~{2}) 불만족:{3}~{4}", min1, max1, from1, to1);
	return false;	
}



function getAllMids(arr) {
  // 배열이 비어 있는지 검사
  if (arr.length === 0) {
    return [];
  }

  // map 함수를 사용하여 모든 mid1 값을 추출
  const mids = arr.map((coordinate) => coordinate.mid);

	const recentMids = arr.slice(arr.length - 3);
	// return mids;
	return recentMids;
}
// 예시
// const arr = [{x: 1, y: 2, mid: 3}, {x: 3, y: 4, mid: 5}];
// const mids = getAllMids(arr);
// console.log(mids); // [3, 5]
function getAverageMid(arr) {
  // 배열이 비어 있는지 검사
  if (arr.length === 0) {
    return 0;
  }

  // mid1 값들의 합을 계산
  const sum = arr.reduce((acc, coordinate) => acc + coordinate.mid, 0);

  // mid1 값들의 평균을 계산
  const average = sum / arr.length;

  return average;
}
// 예시
// const arr = [{x: 1, y: 2, mid: 3}, {x: 3, y: 4, mid: 5}];
// const averageMid = getAverageMid(arr);
// console.log(averageMid); // 4





/** MIDDLE 값을 선택하는 과정을 임시 텍스트AREA에 출력함. */
function printMiddleChoosingProcess(txt) {
	const textarea = document.getElementById('txtRouteArray');

	if (textarea.value.length > 500) {
		textarea.value = "";
	}
	
	textarea.value += txt + "\n";
	
}





/** 겹치느냐 아니냐의 예 그림: https://postimg.cc/cKkWBWrc 
e.g. fiddle is :https://jsfiddle.net/pathfinders3/2bLy93ws/2/ */
function isAreaOverlap(rect1, rect2) {
    // Extract the coordinates and sizes from the rectangles
    var x1 = rect1[0];
    var y1 = rect1[1];
    var size1 = rect1[2];

    var x2 = rect2[0];
    var y2 = rect2[1];
    var size2 = rect2[2];

    // Calculate the boundaries of the rectangles
    var rect1Left = x1;
    var rect1Right = x1 + size1;
    var rect1Top = y1;
    var rect1Bottom = y1 + size1;

    var rect2Left = x2;
    var rect2Right = x2 + size2;
    var rect2Top = y2;
    var rect2Bottom = y2 + size2;

    // Check for overlap
    return (
        rect1Left < rect2Right &&
        rect1Right > rect2Left &&
        rect1Top < rect2Bottom &&
        rect1Bottom > rect2Top
    );
}

/** 흐림도를 분석한다.
wit1 3개를 받아서, 흐린지 평가하라.
tileblury호출하라.

			const lastElem = wit1.at(-1); // lastElem = 구 wit1[2].
			const print1 = printFormat(2296,"자취 수퍼mid값:{0}, 범위({1}~{2}) 전체의Count:{3}", lastElem.mid, lastElem.min0, lastElem.max0, g_witness.length);
			setNewTextInDiv('verbose', `🍁(${print1})`, getRandomColor());			
			evaluateBlocks(wit1);
			
*/
function evaluateBlocks(wit1, minEdge=140, maxEdge=230) {


	let bBlurs = [];
	for (let i=0; i<wit1.length; i++) {
		//let tf = isTileMMMBlurry(wit1[i].min0, wit1[i].max0, 140, 230);
		let tf = isTileMMMBlurry(wit1[i].min0, wit1[i].max0, minEdge, maxEdge);
		bBlurs.push(tf);
		let assist = tf ? '❆' : '➕';

		const print1 = printFormat(2733,"[eval] 이 타일🗔({2},{3}) 블러리? {0}{1}", tf, assist, wit1[i].x, wit1[i].y);
	}
	
	return bBlurs;
}

/** 흐림도 분석 지점을 정하기 위한 좌표 계산.
n: n+1등분할 세로줄 n개의 개수 (N). [짝수여야 할 듯]
리턴: x좌표들의 모음.
*/
function calculateVerticalDivisions(imageWidth, n) {
    // 이미지 높이와 등분할 세로줄의 개수로 각 지점을 계산
    const interval = (imageWidth / (n + 1));
    const divisionPoints = [];

    // 등분 지점을 계산하여 배열에 추가
    for (let i = 1; i <= n; i++) {
        divisionPoints.push(Math.round(interval * i));
    }

    return divisionPoints;
}
/** 흐림도 분석 y start지점을 정하기 위한 좌표 계산.
n: n+1등분할 세로줄 n개의 개수 (N).
리턴: y좌표들의 모음.
*/
function calcFloatingHeight(imageHeight, n) {
    // 이미지 높이와 등분할 세로줄의 개수로 각 지점을 계산
    const interval = (imageHeight / (n + 1));
    let divisionPoint;

    // 등분 지점을 계산하여 배열에 추가
    for (let i = 1; i <= n; i++) {
		divisionPoint = (Math.round(interval * i));
    }

    return divisionPoint;	// y points
}

/** 주어진 1D배열을 2D배열로 간주하여(n1*n1) 각 열의 최소값, 최대값을 반환하는 함수
*/
function getColMinMax(arr, n1) {
  // Check if n1 is a positive integer
  if (!Number.isInteger(n1) || n1 <= 0) {
    throw new Error("n1 must be a positive integer");
  }

  // Validate if the array length is sufficient to form the n1xn1 matrix
  if (arr.length < n1 * n1) {
    throw new Error("Array length is insufficient to create the specified n1xn1 matrix");
  }

  const colMinMax = {};
  for (let col = 0; col < n1; col++) {
    let minVal = Infinity;
    let maxVal = -Infinity;
    for (let row = 0; row < n1; row++) {
      const index = col + row * n1; // Calculate the index in the 1D array
      minVal = Math.min(minVal, arr[index]);
      maxVal = Math.max(maxVal, arr[index]);
    }
	let diff1 = maxVal - minVal;
    colMinMax[col] = [minVal, maxVal, diff1];
  }
  return colMinMax;
}





/** 꺾은선 그리기 
총괄 $draw2Graphs(briger1) 
1개 그리기 함수 drawLineGraph()

내부에서 전역xy으로 brSorted1를 구한다.
*/
function draw2Graphs(superMid1) {
	/** 캔버스 그래프에 4*4 꺾은선 그래프를 그리고, 이전 것도 가져와 그리기(비교) */ 
	const canvasGraph = document.getElementById('canvasGraph');

	const brSorted1 = getTileBrightness(g_act_x, g_act_y, kanban1); // 브라이트1 배열 없이 srt1.	
	
	//drawLineGraph(canvas, data, bClear, bDotted, cColor = null) {
	drawLineGraph(canvasGraph, brSorted1, true, true, superMid1, '#66AA00');	// 새 것.
	drawLineGraph(canvasGraph, g_brSorted1, false, false, superMid1, '#997700'); // 이전 것.
	
	//'#5010EE'
	//drawSuperMiddle(canvasGraph, superMid1, '#E534CC', [20, 3, 3, 3, 3, 3, 3, 3]);
	drawSuperMiddle(canvasGraph, superMid1, '#E534CC', [20, 50, 1]);
	drawSuperMiddle(canvasGraph, g_superMid1, '#E594DC', [10, 60, 1]);

	// 전역을 새 배열로 함(다음 클릭에 대비함)
	g_brSorted1 = [...brSorted1]; // g_brightSorted가 아님. (2개 이름 헷갈림/중복 우려)
	g_superMid1 = superMid1;
	
	// 'add plural witness()' 함수가 있어야 밑으로 add 한다.
	addWitness(brSorted1, g_witness, g_act_x, g_act_y, superMid1);
	
	// return brSorted1;
}

function drawLineGraph(canvas, br1, bClear, bDotted, superMid1, cColor = null) {
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height; 
    
	if (bClear)    // Clear the canvas
		ctx.clearRect(0, 0, width, height);

    // Calculate the gap between each br1 point
    var gap = width / (br1.length - 1);

    // Calculate the maximum value in the br1 array
    var maxbr1 = 256; // 고정 최대값.(그래프상)
    // Calculate the vertical scaling factor
    var scaleY = height / maxbr1;
	
    // Set line style
	if (cColor) {
		ctx.strokeStyle = cColor; // blue color
		ctx.fillStyle = cColor; // blue color
	} else {
	    ctx.strokeStyle = "#7bff00"; // blue color
		ctx.fillStyle = "#7bff00"; // blue color
	}
	// 도트?
 	if (bDotted) {
		ctx.setLineDash([1,1]);
	} else {
		ctx.setLineDash([3,3]);
	}
    ctx.lineWidth = 4;//2.5;
    // Begin drawing the path
    ctx.beginPath();
    ctx.moveTo(0, height - br1[0] * scaleY);

    // Draw lines to connect each br1 point
    for (var i = 1; i < br1.length; i++) {
        ctx.lineTo(i * gap, (height) - br1[i] * scaleY);
	}
    // Draw the path
    ctx.stroke();
    ctx.closePath();
	
    for (var i = 1; i < br1.length; i++) {
        // Draw circle at each data point
        ctx.beginPath();
        ctx.arc(i * gap, height - br1[i] * scaleY, 2, 0, Math.PI * 2);
        //ctx.fillStyle = "#007bff"; // blue color
        ctx.fill();
        ctx.closePath();		
    }
}

// drawSuperMiddle(canvasGraph, g_superMid1, '#997755', 13);
function drawSuperMiddle(canvas, superMid1, cColor, dash2) {
    var ctx = canvas.getContext("2d");
    var width = canvas.width;
    var height = canvas.height; 
    
	// if (bClear)    // Clear the canvas
		// ctx.clearRect(0, 0, width, height);

    // Calculate the maximum value in the br1 array
    var maxbr1 = 256; // 고정 최대값.(그래프상)
    // Calculate the vertical scaling factor
    var scaleY = height / maxbr1;
	
    // Set line style
	if (superMid1 <= 0) {
		superMid1 = 5;
		ctx.strokeStyle = cColor; // blue color
		ctx.fillStyle = cColor; // blue color		
	} else {
		ctx.strokeStyle = cColor; // blue color
		ctx.fillStyle = cColor; // blue color
	}
	
	//ctx.setLineDash([5,5]);
	// ctx.setLineDash([5,dash2]);
	ctx.setLineDash(dash2);
	
    ctx.lineWidth = 1.5;
    // Begin drawing the path
    ctx.beginPath();
    //ctx.moveTo(0, height - superMid1 * scaleY);

	// 미들라인
    ctx.beginPath();
    ctx.moveTo(0, height - superMid1 * scaleY);
	ctx.lineTo(width, height - superMid1 * scaleY);
    ctx.stroke();
    ctx.closePath();
}



// ---------------------IMAGES DROP FILES------------------------------------------
// ---------------------파일 여러개 드롭용------------------------------------------
// Function to handle dropped files
function handleFiles(files) {
    //var images = [];
	g_images = [];// 전역으로 사용함
    var promises = [];

    // Function to load image as data URL and return a promise
    function loadImageAsDataURL(file) {
        return new Promise(function(resolve, reject) {
            var reader = new FileReader();
            
            reader.onload = function(event) {
                var img = new Image();
                img.src = event.target.result;
                g_images.push(img);	/** ↑↑ 배열에 데이터 넣기 */
                resolve();
            };

            reader.onerror = function(event) {
                reject(event.target.error);
            };

            reader.readAsDataURL(file);
        });
    }

    // Iterate over each file and create a promise for each image loading process
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        
        // Check if the file is an image
        if (!file.type.startsWith('image/')) {
            console.log('File is not an image:', file.name);
            continue;
        }
        
        var promise = loadImageAsDataURL(file);
        promises.push(promise);
    }

    // Resolve all promises when all images are loaded
    Promise.all(promises)
    .then(function() {	/** THEN! */
        // All images are loaded, perform the next task here
        console.log("All images loaded:", g_images);
		for (let i=0; i<files.length; i++) {
			// for (let i=0; i<g_images.length; i++) {
			printFormat(3122,"📈({1})파일명 {0}", files[i].name, i);
			printFormat(3132,"📈이미지 크기 {0}*{1}", g_images[i].width, g_images[i].height);
		}	
        // Example: Display all images
        g_images.forEach(function(img) {
            // document.body.appendChild(img); // 그림을 바로 추가하진 않는다. 1by1.
			// canvas2_original_bgi
        });
		
		/** 이미지들 중 첫번째, 1개를 캔버스에 로드한다(확대축소 해야 보임) */
		if (g_images.length > 0) {
			loadNewImage(canvas2_original_bgi, 0);
			
        } else {
            // Print a message indicating that there are no images loaded
            console.log("No images loaded to copy");
        }
		
    })
    .catch(function(error) {
        console.error("Error loading images:", error);
    });
}


// Function to handle drag and drop events
function handleDrop(event) {
    event.preventDefault();
    // Get the dropped files
    //var files = event.dataTransfer.files;
	g_files = event.dataTransfer.files;
    // Call the function to handle the dropped files
    handleFiles(g_files);
}

// Function to prevent default behavior on dragover
function handleDragOver(event) {
    event.preventDefault();
}

// Get the drop area element
var dropArea = document.getElementById('drop-area');
// Add event listeners for drag and drop events
dropArea.addEventListener('dragover', handleDragOver);
dropArea.addEventListener('drop', handleDrop);
// ---------------------IMAGES DROP FILES------------------------------------------
// ---------------------파일 여러개 드롭용------------------------------------------
