// CONSOLE.LOG()... 축약
const cl = (...args) => console.log(...args);

let btnAddPointRoute;
let blinkTimerId;	// 텍스트 영역의 깜빡임 상황 누적 기록용.



// 초기 콘텐트 로드 후 버튼 등을 셋업해야 한다.
document.addEventListener("DOMContentLoaded", function () {
	const txtFind = document.querySelector('#txtFind');	
	btnAddPointRoute = document.querySelector('#btnAddPointRoute');	
	
	btnTextFind.addEventListener('click', () => {
		const txtFind = document.getElementById('txtFind');
		const lstDef0 = document.getElementById('lstFuncDefinitions0');
		

		if (lstDef0 == null || lstDef0 == undefined) {
			console.error("리스트를 먼저 세팅하시요. Show 버튼 2개중 한개를 눌러서...");
			return;
		}

		findKeywordInSelectAndSelect(lstDef0, txtFind.value);
	});

	// 리팩토링용 편집 박스.
	const editDiv1 = document.getElementById('editableDiv');
	editDiv1.addEventListener('keydown', function(event) {
		// 에디트 DIV는 RESERVED로 남겨놓는다. 혹시몰라서
		// F9를 여기서 좌우 분리용으로 처리.
		
	});
	
/* 	const kwd2 = document.getElementById('kwd2');
	kwd2.addEventListener('keydown', function(event) {
		if (event.key === "@") {	/** textarea에서도, 단어추출 위하여 F9 키 
			cl("YOU PRESSED @@ ");
			// 여기서 좌우를 갈라 , kwd1,3으로 분산시킨다.
			event.preventDefault(); // Prevent the default behavior (e.g., inserting the "@" character)
		}
	}); */
	
});


/**
함수들의 정의 라인 1줄씩 추출한다.
RESULT:
[{  functionName: "moveCaret2",  parameters: ["posArr"]}, true(HTML CALL여부) 
{  functionName: "mafa1",  parameters: ["posArr"]}, isHTMLCall?, /(한줄 주석 여부)
{  functionName: "mafa2",  parameters: ["posArr", "fda"]}]

* 한줄 주석 예 : e.g. // function gotoLine() {
*/
function extractFuncDefinitions() {
  // Get the <textarea> element by its ID
  const textarea = document.getElementById('code1');

  if (textarea) {
    // Split the content of the textarea into lines
    const lines = textarea.value.split('\n');

    // Regular expression to match function definitions with parameters
    const functionRegex = /^function\s+(\w+)\s*\(([^)]*)\)/;
	const htmlCallRegex = /\/\/ !!HTML_call/; // external call indicator[=this func in use].
	const RemarkRegex = /^\/\/\s*function\s/; // 어차피 함수선언부로 인식이 안된다. 위 REG때문에.
    const functionInfo = [];

    // Loop through each line and check for function definitions
    // for (const line of lines) {
	for (const [lineNumber_pure, line] of lines.entries()) {
		
	  const matchHTML = line.match(htmlCallRegex); // html 콜이냐 여부 미리 체크
	  let isHtmlCall = false;
	  if (matchHTML) isHtmlCall = true;

	  // 주석부터 시작하는 줄은 아예 함수부로 인식이 안되어 아래 루틴이 사용 안되게 된다.
	  // 구간형 ** 주석에서만 함수 선언부가 선언부로 인식된다.(오인된다).
	  const matchRemark = line.match(RemarkRegex); // 한줄 주석 여부도 미리 체크
	  let isRemark = false;
	  if (matchRemark) isRemark = true;
	  
	  
      const match = line.match(functionRegex);
      if (match) {
        // Extract the function name (group 1) and parameters (group 2)
        const functionName = match[1];
        const parameters = match[2].split(',').map(param => param.trim());
		//functionInfo.push({ functionName, parameters });
		const lineNum = 1+parseInt(lineNumber_pure);
        functionInfo.push({ functionName, parameters, isHtmlCall, isRemark, lineNum });
      }
    }

    return functionInfo;
  } else {
    // Handle the case where the 'code1' element is not found
    return null;
  }
}

// 리스너 시작 라인에서 명칭을 추출 리턴한다.
// e.g. 'D.O.M.Content-Loaded'
function getListenerString(line1) {
	const regListener = /(.+)\.addEventListener\(['"](.+)['"],\s+[f\(]/;
	
	const match = line1.match(regListener);
	if (match) {
		// cl(match[1], "리스너 문자열 2개");
		return match[1] + ":" + match[2];
	}
	
	return null;	// NOT MATCH.
}

// 리스너의 정의만 모아서 리턴해본다
function extractListenerDefinitions() {
  // Get the <textarea> element by its ID
  const textarea = document.getElementById('code1');

  if (textarea) {
    // Split the content of the textarea into lines
    const lines = textarea.value.split('\n');

    // Regular expression to match function definitions with parameters
    const function2Regex = /(\w+)\.addEventListener\(["'](\w+)["'],/;
    //const function2Regex = /(\w+)\.addEventListener\(["'](\w+)["'],\s*function\s*\(([^)]*)\)\s*{|\w+\.\w+\./;
	
    const function2Info = [];

    // Loop through each line and check for function definitions
    // for (const line of lines) {
	for (const [lineNumber_pure, line] of lines.entries()) {
      const match = line.match(function2Regex);
      if (match) {
		  cl(match.length);
		  cl(match[0], "a match114");	// whole match string
		  cl(match[1], "a match114-1"); //	btnsomething
		  cl(match[2], "a match114-2");	// click or mousemove...
		  
		  cl(lineNumber_pure);
        // Extract the function name (group 1) and parameters (group 2)
        const functionName = match[1] + '_'+match[2];
        const parameters = match[2];
		const isHtmlCall = true;
		const isRemark = false;
		
		const lineNum = 1+parseInt(lineNumber_pure);
        function2Info.push({ functionName, parameters, isHtmlCall, isRemark, lineNum });
      }
    }

    return function2Info;
  } else {
    // Handle the case where the 'code1' element is not found
    return null;
  }
}


// 정의부가 아닌, 그 함수를 부르는 호출문들을 모아 리턴한다. 
function extractFunctionCallsWithLineNumbers() {
  const textarea = document.getElementById('code1');

  if (textarea) {
    const lines = textarea.value.split('\n');
    const define1 = /(function)\s+\w+\(/g;
    const functionCallRegex = /\w+\s*\(.*\);/g;
	const regRemark = /\/\/\s*\S.+\(.*\);/g;

    const functionCallsWithLineNumbers = [];

    for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		let isRemark = false;	// true면 흐리게.
		const match1 = line.match(define1);
		// Skip function definitions 발견한 게 함수 정의 라인이라면, 원하는 라인이 아니다.		
		if (match1) 
			continue;
	  
		const matchRemark = line.match(regRemark);
		if (matchRemark) isRemark = true;

		const match2 = line.match(functionCallRegex);
		if (match2) {
			const functionName = match2[0];
			//functionCallsWithLineNumbers.push({ functionName, lineNumber: i + 1 });
			functionCallsWithLineNumbers.push({ functionName, lineNumber: i + 1, isRemark });
		}
    }

    return functionCallsWithLineNumbers;
  } else {
    return null;
  }
}

// Example usage:
//const functionCallsInfo = extractFunctionCallsWithLineNumbers();
//console.log(functionCallsInfo);




// 선택 안되는 것을 억지로 선택되게 하기 위한 또다른 함수.
function setCaretSel(textareaId, nn, n2) {
  let t1 = document.getElementById(textareaId); // usually CODE1
  t1.setSelectionRange(nn, nn); // Needed, to Scroll.
  t1.blur();  
  t1.focus();  
  t1.setSelectionRange(nn, n2);  
}

// 보통 code1인 텍스트영역에서 특정 라인을 선택해 하이라이트 효과를 낸다.
// goto line 2 에서도 사용한다.
function selectLine(textareaId, lineNumber) {
  const textarea = document.getElementById(textareaId);

  if (!textarea) {
	console.error(`Textarea with ID ${textareaId} not found.`);
	return;
  }

  // Split the content by lines
  const lines = textarea.value.split('\n');
	
  // Get the start and end positions for the selected line
  let startPosition = 0;
  let endPosition = 0;
  for (let i = 0; i < lineNumber - 1; i++) {
	startPosition += lines[i].length + 1; // Add 1 for the newline character
  }
  endPosition = startPosition + lines[lineNumber - 1].length;

 
  // Set the selection range
  //textarea.setSelectionRange(startPosition, endPosition);
  setCaretSel(textareaId, startPosition, endPosition);
  
  // Scroll to the selected line
  //scrollToLineNumber(textareaId, lineNumber);
}


// 주어진 줄로 텍스트AREA 를 스크롤시킨다.
function scrollToLineNumber(textareaId, lineNumber) {
  const textarea = document.getElementById(textareaId);
  if (!textarea) {
	console.error(`Textarea with ID ${textareaId} not found.`);
	return;
  }

  // Split the content by lines
  const lines = textarea.value.split('\n');
  // Get the total height of the textarea
  const totalHeight = textarea.scrollHeight;
  // Calculate the average line height
  const averageLineHeight = totalHeight / lines.length;
  // Calculate the scroll offset
  const scrollToOffset = (lineNumber - 1) * averageLineHeight;
  // Scroll to the approximate position
  textarea.scrollTop = scrollToOffset;
}



// HTML Listen 인풋 박스에 쓴 그 줄로 간다.
function gotoLine() {	// !!HTML_call
	const txtLine = document.getElementById('goto_line');
	const line1 = parseInt(txtLine.value);

	scrollToLineNumber('code1', line1);
}

// 버튼에 달린 준 ID1에 해당하는 메타데이터에 지정된 줄로 이동한다. 
function gotoLine_ByMeta2(id1) {
	const button = document.getElementById(id1);
	//const button = document.getElementById("btnNextFoo");
	const lineNum1 = button.dataset.lineNum;
	cl("메타 라인넘은 ", lineNum1);
	gotoLine2(lineNum1);
}


// PREV Bar 가 표시한 라인 넘버를 버튼에 배정.
function setMeta_Prev(lnum) {
	const button = document.getElementById("btnPrevFoo");
	button.dataset.lineNum = lnum;
}

// NEXT Bar (DIV) 가 표시한 라인 넘버를 버튼에 배정.
function setMeta_Next(lnum) {
	const button = document.getElementById("btnNextFoo");
	button.dataset.lineNum = lnum;
}

// 인풋 박스에 라인 줄 번호를 써 준다
function setGotoLine(line1) {
	const txtLine = document.getElementById('goto_line');
	
	txtLine.value = line1;
}


// 그 라인으로 간다.
function gotoLine2(line1) {
	scrollToLineNumber('code1', line1);
	// 라인에 하이라이트 준다
	selectLine('code1', line1);	
}

// 현재 커서가 위치한 줄 텍스트 리턴.
function getCaretLineText(textarea, row) {
	let caretPosition = textarea.selectionStart;
	const lines = textarea.value.split("\n");
	
	return lines[row];
}

// 현재 커서가 위치한 곳의 줄번호 표시
function getCaretLineNumber(textarea) {
  let caretPosition = textarea.selectionStart;
  let lineNumber = 1;
  let lineText = textarea.value.slice(0, caretPosition);
  let lineBreaks = lineText.match(/\n/g);

  if (lineBreaks) {
    lineNumber += lineBreaks.length;
  }

  setGotoLine(lineNumber);
  
  return lineNumber;
}

/** 커서 열 위치 리턴 */
function getCursorHorizonPosition(textarea) {
  const cursorIndex = textarea.selectionStart;
  // 현재 커서의 행과 열 위치를 가져오기
  const lines = textarea.value.substr(0, cursorIndex).split('\n');
  const currentLine = lines.length;
  const currentColumn = lines[lines.length - 1].length; // 배열 읽기용이므로 +1 안함.

  return currentColumn;
}

/**텍스트 영역에서 현재 줄의 첫 번째 열로 캐럿을 이동 후 INDEX1 만큼 증가.*/
function moveCaretToColumn(index1) {	// index1: 0 이 기본값이고, 3 이면 컬럼 3으로 이동.
  const textarea = document.getElementById('code1');
  const cursorPosition = getCursorPosition();
  // Calculate the index of the first character of the current line
  const firstCharIndex = textarea.value.lastIndexOf('\n', cursorPosition.index - 1) + 1;
  const movedIndex = firstCharIndex + index1;
  // Set the new caret position to the first column of the current line
  textarea.setSelectionRange(movedIndex, movedIndex);
}

/**getCursorHorizonPosition()과 같은 함수. 리턴값만 많음.*/
function getCursorPosition() {	//getCursorHorizonPosition()과 같은 함수. 리턴값만 많음.
  const textarea = document.getElementById('code1');
  const cursorIndex = textarea.selectionStart;

  // Get the current line and column number
  const textBeforeCursor = textarea.value.substring(0, cursorIndex);
  const lines = textBeforeCursor.split('\n');
  const currentLine = lines.length;
  const currentColumn = lines[lines.length - 1].length + 1;

  return {
    index: cursorIndex,
    line: currentLine,
    column: currentColumn
  };
}


// textarea에서, 선택된 텍스트를 반환 
function getSelectedTextFromTextarea(textareaElement) {
  // Check if element is a valid textarea
  if (!textareaElement || textareaElement.tagName !== "TEXTAREA") {
    throw new Error("Invalid element provided. Please specify a valid textarea.");
  }
  // Check if there is any text selection
  if (textareaElement.selectionStart === textareaElement.selectionEnd) {
    return "";
  }
 // Get the start and end positions of the selection
  const start = textareaElement.selectionStart;
  const end = textareaElement.selectionEnd;
  // Extract the selected text
  const selectedText = textareaElement.value.substring(start, end);

  return selectedText;
}


// textarea의 내용을 전부 주고, 두 줄 사이의 구간을 추출해 리턴 한다.
function extractTextBlock(textarea1, line1, line2) {
  let text = textarea1.value;

  // Check for invalid inputs
  if (!text || !line1 || !line2 || line1 < 1 || line1 > line2) {
    return [];
  }
  // Split the text into lines
  const lines = text.split('\n');
  // Extract the specified lines
  const extractedLines = lines.slice(line1 - 1, line2);

  return extractedLines;
}

// 위의 extractLines를 다른 텍스트 영역에 복사하는 다른 함수
function copyTextBlockToTextarea(extractedLines, targetTextarea) {
  //const targetTextarea = document.getElementById(targetTextareaId);

  // Check if the element is a textarea
  if (!targetTextarea || targetTextarea.tagName !== 'TEXTAREA') {
    throw new Error(`Invalid target element: ${targetTextareaId}`);
  }

  // Clear the target textarea
  targetTextarea.value = "";

  // Append each extracted line to the textarea
  extractedLines.forEach((line) => {
    targetTextarea.value += `${line}\n`;
  });
}



// 기존 GOTO 버튼들을 클리어 삭제 한다.
function resetGoButtons() {
	const divElement = document.getElementById('def2');

	// Check if the div exists
	if (divElement) {
		removeBRTags(divElement);
		// Loop through child elements and log tag names
			for (var i = divElement.children.length-1; i >= 0 ; i--) {
				//console.log('기존 택 네임',divElement.children[i].tagName);
				if (divElement.children[i].tagName == 'BUTTON') {
					divElement.removeChild(divElement.children[i]);
				}
		}
	}
}
// 리턴문들을 모은 목록을 지워서 새로 쓸 준비를 한다
function resetReturnerButtons() {
	const divElement = document.getElementById('def3');

	// Check if the div exists
	if (divElement) {
		removeBRTags(divElement);
		// Loop through child elements and log tag names
			for (var i = divElement.children.length-1; i >= 0 ; i--) {
				//console.log('기존 택 네임',divElement.children[i].tagName);
				if (divElement.children[i].tagName == 'BUTTON') {
					divElement.removeChild(divElement.children[i]);
				}
		}
	}
}



// 정한 수만큼 특정 문자로 이루어진 문자열 만들어 리턴.
function generateString(numberOfCharacters) {
  let string = "";
  for (let i = 0; i < numberOfCharacters; i++) {
    //string += "?"; 
	string += "▶";
  }
  if (numberOfCharacters == 0) {
	string = "??";
  }
	//debugger;

  return string;
}


// 라인 가기용 다이나믹 버튼 추가 
// extraValue : 줄 번호.
// 버튼이 들어갈 DIV는 정해져 있다.
function add_GoButton(id, label, extraValue, isRemark, param_count) {
	// Create a new button element
	var button = document.createElement('button');
	const bars = generateString(param_count);
	
	// Set the button's attributes
	button.id = id;
	button.innerHTML = bars +": "+label;
	button.title = 'at line ' + id;
	
	// 호출이지만 주석처리 됐을 경우, 버튼으로 표시는 해주지만 흐리게 한다.
	if (isRemark) {
		button.removeAttribute('class');
		button.classList.add('btnGotoRemark');
		button.classList.add('btnCalling'); // 이 박스의 CSS클래스 정의해주기		
	} else {
		button.removeAttribute('class');
		button.classList.add('btnGotoNormal');
		button.classList.add('btnCalling'); // 이 박스의 CSS클래스 정의해주기		
	}
	
	// Set data-extra-value using a data attribute
	button.dataset.extraValue = extraValue;

	// Attach the onclick event to call foo2()
	button.onclick = function() {
		gotoLine2(extraValue);
		//setGotoLine(extraValue);	// 인풋 박스에 이 호출부 줄번호를 넣는다
	};

	// 버튼 제거할 때 DEF2의 BR 내용물도 모두 제거. (이것의 PARENT에서 불러야할 수도 있으나 이 addgo 함수내에 일단)
	const divContainer = document.getElementById('def2');
	if (divContainer) {
		// Append the select element to the div container
		divContainer.style.maxWidth = '440px';
		divContainer.appendChild(button);
		divContainer.appendChild(document.createElement('br')); // Add a line break

		
	} else {
		console.error("Error: 'def2' element not found.");
	}	
	// Append the button to the body or another desired location
	//document.body.appendChild(button);
}

function isCommentedLine() {
}

// 이전 함수인 addgobutton 에서는, 루프를 밖에서 돌았지만, 이 함수에선, 내부에서 처리하기로 함.
// e.g. arg1: {line: 167, statement:"return functionCallsWithLineNumbers;", isCommentLine? T/F }
function add_ReturnersButton(rets1) {
	resetReturnerButtons();
	

	const divContainer = document.getElementById('def3');
	
	if (Array.isArray(rets1)) {
		//rets1.forEach(index => {
		rets1.forEach(returnObj => {
			var button = document.createElement('button');
			button.id = returnObj.line;
			button.innerHTML = returnObj.statement;
			button.title = 'at line ' + returnObj.line;
			// button.classList
			button.classList.add('btnReturn'); // 이 박스의 CSS클래스 정의해주기
			
			if (returnObj.isCommentLine) {
				button.classList.add('btnGotoRemark');
			}

			button.onclick = function() {
				gotoLine2(returnObj.line);
			};
			
			divContainer.appendChild(button);
		});
	}
}


// 주어진 div 태그에서 br 태그를 제거하는 자바스크립트 함수를 작성할 수 있습니까
function removeBRTags(divTag) {
  if (divTag.tagName.toLowerCase() !== 'div') {
    throw new Error('Invalid element type. Expected a divTag.');
  }
  
  // Get all SELECT tags within the div tag
  const selectTags = divTag.querySelectorAll('br');
  
  // Remove each BR tag  // Remove each SELECT tag
  for (const selectTag of selectTags) {
    selectTag.parentNode.removeChild(selectTag);
  }
  
}

// 주어진 div 태그에서 SELECT 태그를 제거하는 자바스크립트 함수를 작성할 수 있습니까
function removeSelectTags(divTag) {
  if (divTag.tagName.toLowerCase() !== 'div') {
    throw new Error('Invalid element type. Expected a divTag.');
  }
  
  // Get all SELECT tags within the div tag
  const selectTags = divTag.querySelectorAll('select');

  // Remove each SELECT tag
  for (const selectTag of selectTags) {
    selectTag.parentNode.removeChild(selectTag);
  }
}

// 예, 다음은 select 요소에서 특정 옵션의 다음 옵션을 찾는 JavaScript 함수입니다.
function getNextOption(selectElement, currentIndex) {
  let options = selectElement.options;
  let nextIndex = currentIndex + 1;

  if (nextIndex < options.length) {
    return options[nextIndex];
  } else {
    return null;
  }
}

// 전방 모든 선언 종류 발견시 정지. ↑..↓
function getRawBackDisclosure(textarea1, currentLine) {
	const backLam4 = getRawBackLambda(textarea1, currentLine);
	const backFoo4 = getRawBackFunction2(textarea1, currentLine);
	

	
	const lam5 = backLam4.lineNum ?? -4999;	// 표시용으로서 실제 GOTO는 안하므로
	const foo5 = backFoo4.lineNum ?? -4999;	// 표시용으로서 실제 GOTO는 안하므로
	
	const backNumber = (lam5 > foo5) ? lam5 : foo5;	// 더 큰 값을 선택해야 더 최근이다.
	const backDisclosureName = (lam5 > foo5) ? backLam4.functionName : backFoo4.functionName;
	const backParameterType = (lam5 > foo5) ? backLam4.parameters : backFoo4.parameters;
	
	return { lineNum:backNumber, backParameterType, functionName:backDisclosureName  };	
}

// 람다 함수와 익명 함수를 올라가며 찾는다.
function getRawBackLambda(textarea, startLine) {
	//let ret = [];
	let ret = 1999;
    const lines = textarea.value.split('\n');
    const regAnony = /(.+)function +\(\)/;
    const regArrow = /\(\) +=> +{/; // /() => {/;

	// 시작 줄(given-1)에서 1줄 전부터 올라간다.
    for (let i=(startLine-1)-1; i >=0; i--) {
        const line = lines[i];
        
        const isAnony = line.match(regAnony);
        const isArrow = line.match(regArrow);

        // Check if the number of open braces is zero, indicating the end of the function
        if (isAnony) {
        	// console.log('익명', isAnony[1]);
			ret = i+1;
			const concise1 = getListenerString(line);
			return { lineNum:ret, parameters:['anon'], functionName:concise1 };
        } else if (isArrow) {
        	//console.log('ARROW 17', line);
			//ret.push({ ln:i+1, st:isArrow[1] });
			ret = i+1;
			const concise1 = getListenerString(line);
			return { lineNum:ret, parameters:['arro'], functionName:concise1 };
        }
    }

	return { lineNum:-2999, parameters:[], functionName:'NoName' };	// 단지 줄번호만 리턴한다
	// return ret;
}



// 주어진 줄번호로부터 함수 구간(시작부)을 알아내는 함수.
function getRawBackFunction2(textarea1, curLine) {
	const lines = textarea1.value.split('\n');
    const functionRegex = /^function\s+(\w+)\s*\(([^)]*)\)/;
	
	// for (let i = lines.length - 1; i >= 0; i--) {
	const startLine = curLine;
	for (let i = startLine - 1; i >= 0; i--) {
        const lineNumber_pure = i + 1;
        const line = lines[i];		
		
		const match = line.match(functionRegex);

		if (match) {
			// Extract the function name (group 1) and parameters (group 2)
			const functionName = match[1];
			const parameters = match[2].split(',').map(param => param.trim());
			const lineNum = parseInt(lineNumber_pure);
			// functionInfo.push({ functionName, parameters, lineNum });
			return { lineNum, parameters, functionName };	// 단지 줄번호만 리턴한다
		}
	}
	return { lineNum:-2999, parameters:[], functionName:'NoName' };
}

// 주어진 줄번호로부터 함수 구간(시작부)을 알아내는 함수.
function getRawBackFunction(textarea1, curLine) {
	const lines = textarea1.value.split('\n');
    const functionRegex = /^function\s+(\w+)\s*\(([^)]*)\)/;
	
	// for (let i = lines.length - 1; i >= 0; i--) {
	const startLine = curLine;
	for (let i = startLine - 1; i >= 0; i--) {
        const lineNumber_pure = i + 1;
        const line = lines[i];		
		
		const match = line.match(functionRegex);

		if (match) {
			// Extract the function name (group 1) and parameters (group 2)
			// const functionName = match[1];
			// const parameters = match[2].split(',').map(param => param.trim());
			const lineNum = parseInt(lineNumber_pure);

			return lineNum;	// 단지 줄번호만 리턴한다
		}
	}
}

// 함수의 끝을 찾는다. 단, 주석처리된 브라켓이 없어야 함.(구:findEndOfFunction)
// 결과 콘솔 출력: https://postimg.cc/cvZ88f6y
function getRawForthFunction(textarea, startLine) {
    const lines = textarea.value.split('\n');
    let openBraceCount = 0;

	// cl("주어진 스타트라인:",startLine-1);
    for (let i = startLine - 1; i < lines.length; i++) {
        const line = lines[i];
		
		if (undefined == line) {
			continue;
		}
		
        // Count opening and closing braces
        openBraceCount += (line.match(/{/g) || []).length;
        openBraceCount -= (line.match(/}/g) || []).length;

        // Check if the number of open braces is zero, indicating the end of the function
        if (openBraceCount === 0 && i > startLine - 1) {
			// console.log(`끝줄 ${line}, No:${i+1}`);
            return i + 1; // Return the line number of the closing brace
        }
    }

    return -1; // Return -1 if the end of the function is not found
}




/*
  ┌───
─┴───
*/
function extractCallSteps(startLine, endLine) {
	const textarea1 = document.getElementById('code1');	  
	const lines = textarea1.value.split('\n');
	const regCalls = /\w+\s*\(.*\);/;
	const regCurly9 = /\((.+)\)/;	// a.b(blah.x()) 등에서 우측 속괄호는 다 없앤다.(연산 편의를 위함)
	const regDot = /[\w\[\]]+\.\w+\(.*\)/; // Dot라인 캐치:a.b(k)만 잡고, a(k)는 내버려두는 식.
	/** TEST 해볼 것: Site는 regexr.com/7osud
	a.b(); // 노 파라메터 시.
	return match[1].split(k); // 꺽쇠 포함시.
	**/
	
	const callSteps = [];
	
	for (let i=startLine-1; i < endLine; i++) {
		if (i<0) {	// -999 시리즈의 괴상한 라인값이 주어질 수도 있다. 커서 위쪽으로 찾다보면...
			console.error(i, "부적절한 라인값. Inappropriate Line Number Given");
			return callSteps;//[];
		}
        const line = lines[i].trim();
		
		// 호출문을 먼저 바꿀 것인가, 아니면 여러 (K)들을 확보할 것인가?
		// K를 만들어 놓고 호출문 여부를 판단해야 한다. 어떤 라인이건 간에...
		const replacedLine = line.replace(regCurly9, "(k)");
		// a.b(k) 이면 안되고, b(k) 식이면 된다.
		const isDotCallLine = replacedLine.match(regDot);	// a.b(k)를 우선 솎아낸다. b(k)만 남음.
		if (isDotCallLine) {
			continue; // 이 줄이 a.b(k) 라면 추가하지 않고 next line 점검.
		}
		
		// 원래 regCalls로 테스트하면 위 두 개를 다 가져오지만 regDot이 닷콜을 제거하였음.
		const hasCall = regCalls.test(replacedLine);	// 호출문 가지고 있습니까
		if (hasCall) {
			const isCommentLine = false; // 항상 FALSE, 잠시....
			callSteps.push({ lineNum:i+1, functionName:line, isCommentLine });
		}
	}
	
	if (callSteps.length == 0) {
		setTextFlashInDiv('verbose1', '사용자 함수 호출이 없음.');
	}
	return callSteps;
}



function extractReturnStatements(textarea, lineNum1, lineNum2) {
	const lines = textarea.value.split('\n');
	const regReturnC = /^return \{.+\};/;	// ^이라, 트림을 전제로 함.
	const regReturnS = /^return [\(\)a-zA-Z0-9\_ \-\+]+;/; // 한줄 리턴문.
	
	const regComment_C = /return [\(\)a-zA-Z0-9\_ \-\+]+;/;
	const regComment_S = /return \{.+\};/;	// ^이라, 트림을 전제로 함.
	
    const extractedReturns = [];
	
    
    for (let i = lineNum1 - 1; i < lineNum2; i++) {
        const line = lines[i].trim();
		const hasReturn_C = regReturnC.test(line);
		const hasReturn_S = regReturnS.test(line);
		
		const hasComment_C = regComment_C.test(line);
		const hasComment_S = regComment_S.test(line);

		let isCommentLine = null;
		let chunkIndex = -1;
		if (hasReturn_C || hasReturn_S) {	// 복합 리턴문이 있다면, 그 줄을 기록
			chunkIndex = line.indexOf('return ');
			isCommentLine = false; // it is REAL return.
		} else if (hasComment_C || hasComment_S) {	// 리턴문이 아니라면 코멘트된 리턴일 수있다.
			chunkIndex = line.indexOf('return ');	// 주석처리된 것도 리턴을 해준다.
			isCommentLine = true; // it is unreal return. (only for reference)
		}		

        if (chunkIndex !== -1) {
            const returnStatement = line.substring(chunkIndex);
            extractedReturns.push({ line: i + 1, statement: returnStatement, isCommentLine });
        }
    }

    return extractedReturns;
}



// SELECT 박스에서 OPTION 항목의 요소를 구해 배열을 반환한다.
// SELECT 리스트 박스에서, data-is-remark 와 같은 추가적 엑스트라 데이터 목록을 구한다.
// 리턴값 그림: https://postimg.cc/4mf1XWvn
function getDatasetProperties(options, property) {
  // Check if options is an array
  if (!Array.isArray(options)) {
    throw new Error('Invalid options provided');
  }

  // Create an empty array to store the dataset properties
  const datasetProperties = [];

  // Iterate over all options
  for (const option of options) {
    // Check if the option has dataset properties
    if (option.dataset) {

      // Check if the property exists if provided
      if (property && !(property in option.dataset)) {
		  console.error(option.dataset, "안에 없읍니다: property 이름 틀렸을 것");
		  continue;
	  }

      // Add the dataset property to the array
	  // {함수명, 줄번호}의 배열을 리턴.
	  datasetProperties.push({ key:option.value, value:option.dataset[property] });
	  //datasetProperties.push({ linenum:option.value, value: });
    }
  }

  return datasetProperties;
}


/**
* 
generateSelectOptions을 추후 대체하는 construct 시리즈 함수.
constructSelectBox() 이 함수는 extractCallSteps() 으로 함수 호출 계층도를 표시한다.
**/
function constructSelectBox() { // !!HTML_call
  const selectElement = document.createElement('select');
  //selectElement.id = '함수 정의 목록 funcdeflist' + defOrLis;
  selectElement.id = 'selectbox03';
  selectElement.size = 9;
  selectElement.style.width = 'auto';
  selectElement.classList.add('definiaSteps'); // 이 박스의 CSS클래스 정의해주기

	const textarea1 = document.getElementById('code1');	   
	const currentLine = getCaretLineNumber(textarea1);
	//const backFoo4 = getRawBackFunction(textarea1, currentLine);	// 시작줄
	//const nextFoo4 = getRawForthFunction(textarea1, backFoo4);  	// 탐색 끝줄(REGExPRESS)
	const backFoo4 = getRawBackDisclosure(textarea1, currentLine).lineNum;
	const nextFoo4 = getRawForthFunction(textarea1, backFoo4);  	// 탐색 끝줄(REGExPRESS)
	
  // 위에서 정의한 함수명으로 호출한다. 리스트 항목을 원시코드에서 추출.
  defs00 = extractCallSteps(backFoo4, nextFoo4);

  // SELECT 리스트 생성임. each item of defs00 목록.
  defs00.forEach(item => {
    // Create an <option> element for each function
    const optionElement = document.createElement('option');
	// item.functionName
    // Set the value and text of the option based on the function name
    optionElement.value = item.functionName;
    optionElement.text = item.functionName;
	optionElement.dataset.isHtmlCall = item.isHtmlCall;
	optionElement.dataset.isRemark = item.isRemark;
	optionElement.dataset.lineNum = item.lineNum;

    // Append the option to the select element
    selectElement.appendChild(optionElement);
  });

  // Get the <div> element with the ID 'def1'
  const divContainer = document.getElementById('def1');
	
	
  if (divContainer) {
    // 리스트박스(SELECT) 추가하다
	removeSelectTags(divContainer);	// DIV태그 내에 있는 SELECTBOX들을 모두 제거한다.
    divContainer.appendChild(selectElement);
	
	const labelElement = document.getElementById("description1");
	labelElement.textContent = '👞 Call Steps (호출도)';
	
  } else {
    console.error("Error: 'def1' element not found.");
  }

  // 호출도(그림 도??) 함수 리스트의 클릭 이벤트 작성. ????????????????
	selectElement.addEventListener('click', function() {
		// 선택된 항목 없을 경우, 아무것도 하지 않음.
		if (-1 == this.selectedIndex) 
			return;
		
		// 기존 def2 버튼들을 지움 (def3도?)
		resetGoButtons();	// 버튼 다 지움.
		resetTextInDiv('params1');	//div 로그 영역 출력물 지움.
		
		const selectedOption = this.options[this.selectedIndex];
		//console.log(`Selected option: ${selectedOption.value}`);
		const gFuncName1 = selectedOption.value;
		
		// ** 대표 정의문에 대한 정보는 아래 블럭에 모은다	
		// let isRemark = selectedOption.dataset.isRemark;
		// isRemark = (isRemark === "true");	// boolean 식으로 바꾼다.	

		const lineNum = selectedOption.dataset.lineNum;
		setGotoLine(lineNum);	// 인풋 박스에 함수 정의부의 줄번호를 넣어준다.
		gotoLine2(lineNum);	// 함수정의로 스크롤 한다. (scrollToLineNumber()의 줄 이동만으로는 정확치 않으므로 해당 부분을 SELECTION을 해줌)
		
		// 여기서 전역(지역) 변수도 보여줘야할 수 있다. +++++++++++++++
		// 그러려면, 끝나는 줄 { } 도 알아야 한다.
		// 끝나는 줄 대신, 다음 함수의 위치로 대체할 수 있다.

		
		// 마지막 인수를 true로 주면 코멘트임을 모른 채, 가져오기 때문에 버튼을 흐릿하게 표시 불가능.
		// 버튼을 흐릿 표시하려면, 코멘트임을 함께 리턴하여야 함.(또는 그 기능 없이 타함수 별도 작성?
		// const returner1 = extractReturnStatements(textarea1, startBracket, endBracket);
		// console.log("RETURNS:",returner1);
		// add_ReturnersButton(returner1);	// 
		// const 를 모아서 SELECT박스로 해주세요
		// gatherVars('code1');
	});	// ??????????????????????????
  
}

// generate함수는 코드체커4 앱에서만 유효하다. (HTML 첵에서는 CONSTRUCT로 변경통일 예정)
function generateSelectOptions(defOrLis) { // !!HTML_call
  // 리스너만 다시 테스트해본다
  let defs00 = null;
    if (defOrLis == 0) // 정의냐 리스너냐 판단.
	defs00 = extractFuncDefinitions();	// 여기서 Html 콜 여부도 체크해야...
  else
    defs00 = extractListenerDefinitions();	// 여기서 Html 콜 여부도 체크해야...
  

  if (!defs00) {
    console.error("Error: 'code1' element not found.");
    return;
  }

  // Create a <select> element
  const selectElement = document.createElement('select');
  //selectElement.id = '함수 정의 목록 funcdeflist' + defOrLis;
  selectElement.id = 'lstFuncDefinitions' + defOrLis;
  selectElement.size = 9;
  selectElement.style.width = 'auto';
  selectElement.classList.add('definia'); // 이 박스의 CSS클래스 정의해주기


  // Add an event listener to the select element for 항목 선택시...
  selectElement.addEventListener('change', function() {
	  resetGoButtons();	// 버튼 다 지움.
	  resetTextInDiv('params1');	//div 로그 영역 출력물 지움.
	  
    const selectedOption = this.options[this.selectedIndex];
    //console.log(`Selected option: ${selectedOption.value}`);
	const gFuncName1 = selectedOption.value;
	showFuncParams(gFuncName1);

	// ** 대표 정의문에 대한 정보는 아래 블럭에 모은다	
	let isHtmlCall = selectedOption.dataset.isHtmlCall;
	isHtmlCall = (isHtmlCall === "true");	// boolean 식으로 바꾼다.
	let isRemark = selectedOption.dataset.isRemark;
	isRemark = (isRemark === "true");	// boolean 식으로 바꾼다.	
	const lineNum = selectedOption.dataset.lineNum;
	
	setTextInDiv('params1', lineNum + "줄번"); 
	setGotoLine(lineNum);	// 인풋 박스에 함수 정의부의 줄번호를 넣어준다.
	
	gotoLine2(lineNum);	// 함수정의로 스크롤 한다. (scrollToLineNumber()의 줄 이동만으로는 정확치 않으므로 해당 부분을 SELECTION을 해줌)
	
	const calls1 = extractFunctionCallsWithLineNumbers();	//  모든 함수 호출 부분 모은 것
	// console.log('콜스(소스내 모든 호출들)',calls1.length);	//// 'ham3();', 'ham4(a,b,c);' ham4(d,e,f)

	//console.log(gFuncName1, " 찾고 있읍니다");	
	const ext_func_names = extractFunctionNames(calls1);
	const indices1 = findStringOccurrences(ext_func_names, gFuncName1);

	// ** 아래는 대표 정의문에 딸린 반복문이 된다.
	// 함수 정의 리스트 박스에서 선택할 때마다 불리우므로, 각 인덱스마다 반복시엔 마지막 인덱스에 대한 함수 정보만 남게 된다.[이것이 문제. 계속 삭제(RESET)하게 됨]
	if (Array.isArray(indices1)) {
	  indices1.forEach(index => {
		const params1 = extractParameters(calls1[index]);
		const param_count = params1.length;	// 파라메터 개수만 버튼에 넣을 것이므로...
		// 버튼에 맡기고 아래 정보는 표시하지 않는다. 길어지므로...
		//setTextInDiv('params1', calls1[index].functionName); // div에, 함수 콜 하나씩 리스트한다
		//setTextInDiv('params1', params1); // 파라메터만 보여 주느냐
		
		// @@ 주석포함 선언부일 수도 있다. 버튼에 흐린 글씨체로 넣어줄 수도 있다.

		// def2에 버튼도 만들어준다. @@ 에러가 안나는 이유?REMARK?에서?
	    add_GoButton(calls1[index].lineNumber, calls1[index].functionName, calls1[index].lineNumber, calls1[index].isRemark, param_count);

	  });
	} else {
		//resetTextInDiv('params1');	// DIV 글자 지우기
		let msg2 = " ";//"Non-HTML";
		if (isHtmlCall) {
			msg2 = "그러나 !!HTML_call 입니다. ";
		}
		
		let msgRemark = "주석부는 아님.";
		if (isRemark) {
			msgRemark = "주석부입니다" + isRemark;
		}
		
		const msg1 = `${lineNum}: ?? 이 함수는 사용되지 않습니다. ${gFuncName1}' ?? FNF: Func NOT FOUND 893 ${msg2} 그리고 ${msgRemark}`;
		setTextInDiv('params1', msg1);
	}	
	
	
  });	// end of 리스너 'change'--------------

	selectElement.addEventListener('click', function() {
		// 'change' 이벤트에서 GOTO만 적용함. (재 선택시 GOTO 하기 위함)
		
		// 선택된 항목 없을 경우, 아무것도 하지 않음.
		if (-1 == this.selectedIndex) 
			return;
		
		const selectedOption = this.options[this.selectedIndex];
		//console.log(`Selected option: ${selectedOption.value}`);
		const gFuncName1 = selectedOption.value;
		
		showFuncParams(gFuncName1);

		const lineNum = selectedOption.dataset.lineNum;
		
		setGotoLine(lineNum);	// 인풋 박스에 함수 정의부의 줄번호를 넣어준다.
		
		gotoLine2(lineNum);	// 함수정의로 스크롤 한다. (scrollToLineNumber()의 줄 이동만으로는 정확치 않으므로 해당 부분을 SELECTION을 해줌)
		
		// 여기서 전역(지역) 변수도 보여줘야할 수 있다. +++++++++++++++
		// 그러려면, 끝나는 줄 { } 도 알아야 한다.
		// 끝나는 줄 대신, 다음 함수의 위치로 대체할 수 있다.
		const textarea1 = document.getElementById('code1');	  
		const startBracket = lineNum;
		const nextOption = this.options[this.selectedIndex+1];
		
		let endBracket = -899;

		if (undefined == nextOption) {	// 다음 위치가 없으면 EOF로 간주, 파일 끝 선까지 지정.
			setTextFlashInDiv('verbose1', "마지막 함수는 RETURN값 체크 불가능.? ");
			return;
			endBracket = startBracket + 100;	// 임의로 지정. 에러날 수 있음.
		} else {
			endBracket = nextOption.dataset.lineNum - 1;	// ???			
		}
		
		// 마지막 인수를 true로 주면 코멘트임을 모른 채, 가져오기 때문에 버튼을 흐릿하게 표시 불가능.
		// 버튼을 흐릿 표시하려면, 코멘트임을 함께 리턴하여야 함.(또는 그 기능 없이 타함수 별도 작성?
		const returner1 = extractReturnStatements(textarea1, startBracket, endBracket);
		// console.log("RETURNS:",returner1);
		add_ReturnersButton(returner1);	// 
		// const 를 모아서 SELECT박스로 해주세요
		// gatherVars('code1');
	});
	
  // SELECT 리스트 생성임. each item of defs00 목록.
  defs00.forEach(item => {
    // Create an <option> element for each function
    const optionElement = document.createElement('option');
	// item.functionName
    // Set the value and text of the option based on the function name
    optionElement.value = item.functionName;
    optionElement.text = item.functionName;
	optionElement.dataset.isHtmlCall = item.isHtmlCall;
	optionElement.dataset.isRemark = item.isRemark;
	optionElement.dataset.lineNum = item.lineNum;

    // Append the option to the select element
    selectElement.appendChild(optionElement);
  });

  // Get the <div> element with the ID 'def1'
  const divContainer = document.getElementById('def1');

  if (divContainer) {
    // 리스트박스(SELECT) 추가하다
	removeSelectTags(divContainer);	// DIV태그 내에 있는 SELECTBOX들을 모두 제거한다.
    divContainer.appendChild(selectElement);
  } else {
    console.error("Error: 'def1' element not found.");
  }
}	/** --- End of generateSelectOptions() --- */

// 선언 정의 부에 대해서만 찾는다
/*
사용함수 : extractFunctionNamesAndParameters()
*/
function showFuncParams(fname1) {
	const targetFunction = fname1;
	const finfo = extractFuncDefinitions();
	
	const targetFunctionInfo = finfo.find(func => func.functionName === targetFunction);

	// Check if the function information was found
	if (targetFunctionInfo) {
	  // console.log(`:990: Function Name: ${targetFunctionInfo.functionName}`);
	  //console.log(`선언된 파라메터 개수: ${targetFunctionInfo.parameters.length}`);
	  //console.log(`선언된 파라메터들: ${targetFunctionInfo.parameters.join(', ')}`);
	} else {
	  console.log(`Function '${targetFunction}' not found or textarea not found.`);
	}
}

/*
foo(1,2,3)에서 1,2,3을 리턴한다.
이 함수는 SelectOptionBox 선택 리스너에서 부른다
*/
function extractParameters(functionCallString) {
	const regex = /\(([^)]*)\)/;
	const fnx = functionCallString.functionName; //???functionName
	const match = fnx.match(regex);

  if (match && match[1]) {
    // Split the parameters by comma and trim any whitespace
    return match[1].split(',').map(param => param.trim());
  } else {
    return [];
  }
}

// Example usage:
// const functionCallString = 'foo(3, 4, 5);';
// const parameters = extractParameters(functionCallString);
// console.log(parameters);


window.addEventListener("keydown", (e) => {

	if (e.key === "F2") {
		/** F2이벤트를,유사한 RawBackDisclosure() 함수로 대체할 수 있는지 봐야한다 */
		const textarea1 = document.getElementById('code1');	  
		const currentLine = getCaretLineNumber(textarea1);
		
		const backLam4 = getRawBackLambda(textarea1, currentLine);
		const backFoo4 = getRawBackFunction2(textarea1, currentLine);	// 시작줄 뿐만 아니라 함수명, 파라메터들 리턴함.
		
		const lineLambda = backLam4.lineNum ?? -1999;	// 표시용으로서 실제 GOTO는 안하므로
		const lineGefunc = backFoo4.lineNum ?? -1999;	// undefined 면 -1999값을 준다.

		const backNumber = (lineLambda > lineGefunc) ? lineLambda : lineGefunc; // 더 아래(최근)인 줄번호를 가져온다.
		const backNumberSt = (lineLambda > lineGefunc) ? lineLambda+": "+backLam4.functionName : lineGefunc+": "+backFoo4.functionName;
		
		const nextFoo4 = getRawForthFunction(textarea1, backNumber);  	// 함수 끝줄
		
		resetTextInDiv('prevFoo');
		resetTextInDiv('nextFoo');
		
		setTextInDiv('prevFoo', backNumberSt);
		setTextInDiv('nextFoo', nextFoo4);	// 끝지점이지만 다음 함수 위치 넣어주는 게 좋음

		setMeta_Prev(backNumber);
		setMeta_Next(nextFoo4);
		
	} else if (e.key === "F4") {	// F4는 변수를 추적해 정보를 알려주려 한다.
		const textarea1 = document.getElementById('code1');	  
		const currentLine = getCaretLineNumber(textarea1);
		const backFoo4 = getRawBackFunction(textarea1, currentLine);
		
		console.log(backFoo4, "이것이 함수 시작 줄 [변수 추적의 토대]");
		
		const nextFoo4 = getRawForthFunction(textarea1, backFoo4);
		
		const block1 = extractTextBlock(textarea1, backFoo4, nextFoo4);
		// 
		// 다른 텍스트 박스에 복사해 넣기(테스트)
		//const textarea2 = document.getElementById('code2');
		//copyTextBlockToTextarea(block1, textarea2);
		// 선택된 변수를 찾아주어야 한다.
		const kwd1 = getSelectedTextFromTextarea(textarea1);
		// console.log(kwd1, "탐색하기로 선택된 변수");
		setTextFlashInDiv('verbose1', "탐색할 변수 "+ kwd1);
		
	} else if (e.key === "F8") {	// F8키는 코드변경, 이름 변경에 사용된다
		const textarea1 = document.getElementById('code1');	  
		const currentLine = getCaretLineNumber(textarea1)-1;
		const single1 = getCaretLineText(textarea1, currentLine);
		
		const editDiv1 = document.getElementById('editableDiv');
		editDiv1.innerHTML = single1;
		
		setIteratorValue(0);	// 새 줄을 사용자가 선택하면, 반복계수를 0으로 초기화한다.
		setTextInput('kwd2', single1); // 첫 값(줄 전체)을 중앙부 '문자분열 박스'에도 둔다.
		setTextInput('kwd1', ""); // 1,3 삭제한다
		setTextInput('kwd3', ""); // 1,3 삭제한다
	} else if (e.key === "F9") {	/** MAIN textarea에서도, 단어추출 위하여 F9 키 */
		const textarea1 = document.getElementById('code1');	  
		const currentLine = getCaretLineNumber(textarea1)-1;
		const single1 = getCaretLineText(textarea1, currentLine);
		
		const starting1 = getCursorHorizonPosition(textarea1);
		const reg1 = /[a-zA-Z_0-9]+/;
		
		/** 백워드 매치만 있으면 된다. (No FWD) */
		//const index1 = findBackwardMatchFromIndex(single1, reg1, starting1);
		const [index1, matchF] = findBackwardMatchFromIndex(single1, reg1, starting1);
		// console.log( single1[starting1],"이 시작점");
		// console.log( "************************ MATCH:: ", matchF);

		moveCaretToColumn(index1);	// 일단 현재 줄의 첫번째 컬럼에서 +index1.
		
		/**single1 즉 한줄만 검색하는 것에서 벗어나, 전체를 찾을 수 있어야 한다.?*/
		/** cGP: 현재의 글로벌 커서위치 */
		const rawInfo = getRawBackDisclosure(textarea1, currentLine);
		const backFoo4 = (rawInfo.lineNum-1 >= 0) ? rawInfo.lineNum-1 : 0;
		// getRawBackDisclosure();
		setTextFlashInDiv('verbose1', rawInfo.functionName);
		//실제 줄로 가본다. 동작함
		// gotoLine2(backFoo4);
		
		// 다 찾는다 '더블클릭된 키워드'를...
		resetTextInDiv('editableDiv');
		for (let i=backFoo4; i <= currentLine; i++) {
			const single1 = getCaretLineText(textarea1, i);
			const tabs = countTabsAtBeginning(single1);// 탭만 추출.
			const leads = generateSpaces(tabs);	// given number of tabs.

			//let fwdCol = findForwardMatchFromIndex(single1, reg1, 0);
			// cl("NONO");
			let [fwdCol, fwdWord] = findForwardMatchFromIndex(single1, matchF, 0);
			//cl("이줄 포워드 결과:", fwdCol);
			if (fwdCol > -1) {
				const leads2 = String(i+1) + ":" + leads;
				// console.log(`${fwdCol} 출력: ${single1}`);
				setColorTextEditDiv(leads2, single1, fwdCol, fwdWord.length, '#DD5500'); 
			}

		}
		
		
		/** KWD 인풋 박스를 사용치 않으나, 아래 줄은 남겨본다.*/
		// setIteratorValue(0);	// 새 줄을 사용자가 선택하면, 반복계수를 0으로 초기화한다.
		// setTextInput('kwd2', single1); // 첫 값(줄 전체)을 중앙부 '문자분열 박스'에도 둔다.
		// setTextInput('kwd1', ""); // 1,3 삭제한다
		// setTextInput('kwd3', ""); // 1,3 삭제한다
	}

  
});

/**
정규식과 전체 일치하는 문자열을 반환합니다
*/  
function findMatches(inputString, eq1) {
  const matches = inputString.match(eq1) || [];

  return matches.map((matchedString, index) => ({
    index: inputString.indexOf(matchedString),
    st:matchedString,
  }));
}
/**
정규식과 일치하는 괄호 그룹 #1의 문자열을 반환합니다
*/  
function findGrpMatches(inputString, eq1) {
  const matches = inputString.match(eq1);

  if (matches) {
    const capturedGroup = matches[1];
    const index = inputString.indexOf(capturedGroup);

    return { index, capturedGroup };
  }
  return null;
}


/**
aaa per|→ception← ccc
문자열을 주어진 위치로부터 후방향으로 (, {, [, 등을 찾음.
해당 줄 내에서의 열 위치(Index)를 리턴한다.
*/
function findForwardMatchFromIndex(str, regex, startIndex) {
  const lastIndex = str.length - 1; //  문자열 마지막 인덱스를 기록 후 Iterate.
  
  for (let i = startIndex; i < str.length; i++) {  // Iterate in reverse order
	const match = str.substring(i, str.length-1).match(regex);

    if (match) {
		// console.log(match[0], "포워드 매칭 contentwd");
		//cl(match.index, "매인?");
      return [match.index, match[0]];	// 매치 스트링이 아니라 인덱스를 반환.
	  // 포워드 매치는 match.index 리턴, 백워드는 substring을 써서 거꾸로 가서 그런지,... 좀 다르다.
    }
  }
  //return startIndex;//-1;	// 아무것도 없으면 그냥 제자리(start지점)
  return [-1, 'None_1323']; // 아무것도 없으면 없다고 명시.(제자리는 캡쳐되므로 안됨)
}

/**
JSFIDDLE? 에서 간소화 됨!!!. FWD 함수도 필요 없게 되었음
aaa →per←|ception ccc
문자열을 주어진 위치로부터 거슬러 (, {, [, 등을 찾음.
해당 줄 내에서의 열 위치(Index)와 찾은 단어를 리턴한다.
*/
function findBackwardMatchFromIndex(str, regex, startIndex) {
  for (let i = 0; i <= startIndex; i++) {
		const match = str.substring(i, str.length-1).match(regex);
    //console.log(str.substring(i,str.length-1));
    
	// match가 안 나오면, 침범 계수 우측은 당연히 없음.
    const invader = (match != null) ? i+match[0].length : -99;
    
    // let tf = (invader > startIndex);    
    // if (tf) console.log("인베이딩B(i+b):",match[0].length);
    // if (!tf) console.log("NO _____:",match[0].length);

    if (match && match.index==0 && invader>startIndex) { // 이것/저것 재는 것이, 어떤 의미인지 머리로는 잘 모른다는 맹점 있음.(연산의 의미)
		console.log(match[0], "백워드 매칭 BWD");
		//return i;
		return [i, match[0]]; // 그 문자열 내의 인덱스와 찾아낸 Match Word를 리턴한다.
    }
  }
  //return startIndex;//-1;	// 아무것도 없으면 그냥 제자리(start지점)
  return [startIndex, "(No Word!)"];
}


/**
JSFIDDLE? 에서 간소화 시도 필요.
aaa →per←|ception ccc
문자열을 주어진 위치로부터 거슬러 (, {, [, 등을 찾음.
해당 줄 내에서의 열 위치(Index)를 리턴한다.
*/
function findMatchFromIndex(str, regex, startIndex) {
  let lastMatch = -1;	// 기본으로 0이 될 것임.(1번 열)

  let succMatch = [null, null];	// t/f/null 중 하나를 가질 수 있다.
  let succIdx = [-1, -1];
  
  for (let i = startIndex; i >= 0; i--) {  // Iterate in reverse order

    const match = str.substring(i, startIndex + 1).match(regex);

    if (match != null && match.index === 0) {	// 정확하게 그 지점에서 매칭 할 때,
		
		succMatch.unshift(true); // [4, 1, 2, 3]
		succMatch.pop();// [4, 1, 2]
		
		succIdx.unshift(i);
		succIdx.pop();
		
		cl(i, match.index);
		cl(match[0], "MATCHED");
		cl(succMatch, succIdx);
		
		lastMatch = i;  // Store the last found match

    } else {// 비껴서 매칭하거나, 안 맞을 때는 그냥 FALSE이다.
		
		succMatch.unshift(false); // [4, 1, 2, 3]
		succMatch.pop();// [4, 1, 2]
		
		succIdx.unshift(i);
		succIdx.pop();

		cl(i, "낫 UNMATCHED");
		cl(succMatch, succIdx);

		if (succMatch[0] === false && succMatch[1] === true) {
			console.log("** Final:",match[0]);
			lastMatch = succIdx[1];
			return lastMatch;
		} //else if (i === 0 && succMatch[0] === true) {
	
	}
	
  }

  if (-1 === lastMatch) {
	console.log("Look Back BUT No MATCH 1334");	  
	return startIndex;	// 발견하지 못하면, 받은 인덱스 그대로 리턴해, 커서가 안움직이게 함.
  }

  return lastMatch;
}


/* function findMatchFromIndex(str, regex, startIndex) {
  let lastMatch = -1;	// 기본으로 0이 될 것임.(1번 열)

  for (let i = startIndex; i >= 0; i--) {  // Iterate in reverse order
    // cl(i,str.substring(i, startIndex + 1));
    const match = str.substring(i, startIndex + 1).match(regex);
    if (match) {
	  console.log(match, i);
	  lastMatch = i;  // Store the last found match
      break;  // Stop iterating once a match is found
    }
  }

  if (-1 === lastMatch) {
	console.log("Look Back BUT No MATCH 1334");	  
	return startIndex;	// 발견하지 못하면, 받은 인덱스 그대로 리턴해, 커서가 안움직이게 함.
  }

  return lastMatch;
}
 */

/* function findMatchFromIndex(str, regex, startIndex) {
  const match = str.substring(0, startIndex + 1).match(regex);
  console.log("매치파인드: ", match.index);
  console.log("매치파인드: ", match);
  return match ? match.index : -1;
}
 */  


/** 문자열을 입력받아 3개로 나눈다.
*/
function makeThreeStrings(str, ii, len0) {
	if (ii < 0 || ii > str.length) {
		throw new Error(ii,"ii 인덱스 부적합합니다");
	}

	const left1 = str.substring(0, ii);	
	const mid1 = str.substring(ii, ii + len0);
	const right1 = str.substring(ii + len0);
	
	return [left1, mid1, right1];
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

// DIV에 지우면서 새로 '안' 넣기
function resetTextInDiv(divId) {
  const targetDiv = document.getElementById(divId);

  if (targetDiv) {
    targetDiv.textContent = "";
  } else {
    console.error(`Div with ID '${divId}' not found.`);
  }
}

/** 인풋 박스의 문자열 수정 하기 */
function setTextInput(id, text) {
	const input = document.getElementById(id);
	if (input) {
		input.value = text;
	}
}

/** 인풋 박스의 문자열 추가하기 */
function appendTextInput(id, text) {
  const input = document.getElementById(id);
  const currentText = input.value;
  input.value = currentText + text;
}
/** 인풋 박스의 문자열 앞에다 추가하기 */
function prependTextInput(id, text) {
  const input = document.getElementById(id);
  const currentText = input.value;
  input.value = text + currentText;
}


/** 3분할 입력박스의 반복계수 지정
*/
function setIteratorValue(nn) {
	const iterator = document.getElementById('kwd_iterator');
	iterator.value = nn;
}
function getIteratorValue() {
	const start = Number(document.getElementById('kwd_iterator').value);
	return start;
}


/*
이 함수의 작성 FIDDLE
https://postimg.cc/YL9Q3TMB
*/
function extractFunctionName(functionCallString) {
  const regex = /^(\w+)\s*\(/;
  const match = functionCallString.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
}

/* 
[foo1(a,b), foo2(a,b)] 이런 식으로 배열로 준다
functionCallStrings는 extractFunctionCallsWithLineNumbers() 의 리턴값.
*/
function extractFunctionNames(callStrings) {
	
	// console.log(callStrings, 'received');

  const regex = /^(\w+)\s*\(/;
  const functionNames = [];

  callStrings.forEach(functionCallString => {
	//console.log("type is", functionCallString.functionName);
	const callingPart = functionCallString.functionName;
	const lineNum = functionCallString.lineNumber;

    const match = callingPart.match(regex);

    if (match && match[1]) {
      functionNames.push(match[1]);
    }
  });

	//console.log(functionNames, "이거이 결과");
  return functionNames;
}






/** Example usage:
const myArray = ['apple', 'banana', 'orange'];
const resultString = arrayToString(myArray);
console.log(resultString);     */
function arrayToString(array) {
  return array.join(', ');
}



/**
함수 콜의 함수이름 중에서, 내가 찾는 함수이름이 있는지를 알려준다 
*/
function findStringOccurrences(array, targetString) {
  const indices = [];
  let currentIndex = array.indexOf(targetString);

  while (currentIndex !== -1) {
    indices.push(currentIndex);
    currentIndex = array.indexOf(targetString, currentIndex + 1);
  }

  return indices.length > 0 ? indices : null; // null:String Not Found.
}

// Example usage:
// const myArray = ['apple', 'banana', 'orange', 'banana', 'grape'];
// const targetString = 'banana';
// const result = findStringOccurrences(myArray, targetString);
// console.log(result);


// LISTBOX에서 찾은 뒤, 커서를 옮겨 선택까지 한다.
function findKeywordInSelectAndSelect(selectTag, keyword) {
  const selectedIndex = selectTag.selectedIndex;
  // Get all options from the select tag
  const options = selectTag.options;

  // Loop through each option (선택된 항목의 다음부터 찾기 시작합니다.)
  for (let i = selectedIndex + 1; i < options.length; i++) {
    const option = options[i];
    const optionText = option.text.toLowerCase();

    // Check if the option text contains the keyword
    if (optionText.includes(keyword.toLowerCase())) {
      // If it does, select the option and scroll to it
      option.selected = true;
      selectTag.scrollIntoView({ behavior: 'smooth' });
	  // console.log("이 키워드를 찾음", optionText);
      return option;
    }

    // Check if any substring of the option text matches the keyword
    for (let j = 0; j < optionText.length; j++) {
      const substring = optionText.substring(j, j + keyword.length);
      if (substring === keyword.toLowerCase()) {
        // If it does, select the option and scrollse to it
        option.selected = true;
        selectTag.scrollIntoView({ behavior: 'smooth' });
        return option;
      }
    }
  }

  // If no option is found, return null, 처음으로도 옮긴다.
  setTextFlashInDiv('verbose1', "더 이상 없음.? ");
  options[0].selected = true;
  selectTag.scrollIntoView({ behavior: 'smooth' });
  
  return null;
}

/*
키 이벤트를 처리합니다. HTML이 부름.
*/
function finderKeyPress(e) { // !!HTML_Call
	// look for window.event in case event isn't passed in
    e = e || window.event;
    if (e.keyCode == 13) {
        document.getElementById('btnTextFind').click();
        return false;	// 성공이므로 일반적인 엔터키 이벤트를 처리하지 않음.
    }
    return true;	// 일반 엔터키 이벤트를 처리함.
}

/*
이 함수의 작성 요청과 GPT설명
https://postimg.cc/tZtGRxHg
setTextFlashInDiv('verbose', "기존 배열 요소와 겹칩니다? ");
*/
function setTextFlashInDiv(divId, text) {
  const targetDiv = document.getElementById(divId);

  if (targetDiv) {
    targetDiv.innerHTML = text;
    targetDiv.style.animation = 'blink 1s linear infinite';

    // Clear the timer outside the setTimeout callback
    clearTimeout(blinkTimerId);

    // Set a timer to stop blinking after 4 seconds
    blinkTimerId = setTimeout(function() {
      document.getElementById(divId).style.animation = 'none';
    }, 4000);
  } else {
    console.error(`Div with ID '${divId}' not found.`);
  }
}

/** DIV에 색깔 텍스트 출력 
ii ; 줄 번호
lead ; 보통, tab들.
text ; 원본, (index-length조합); 하이라이트할 단어, color; 색깔.
*/
function setColorTextEditDiv(leadString, text, startIndex, length, color) {
  // Create spans for the parts before, during, and after the specified substring
  const before0 = document.createTextNode(leadString);
  const before = document.createTextNode(text.substring(0, startIndex));
  const target = document.createElement('span');
  target.style.color = color;
  target.style.backgroundColor = "#353500";
  //target.style.backgroundColor = (bgi % 2 ===0) ? "#353500" : "#653500";
  target.appendChild(document.createTextNode(text.substring(startIndex, startIndex + length)));
  const after = document.createTextNode(text.substring(startIndex + length));

  // Append the spans to the output div
  const outputDiv = document.getElementById('editableDiv');

  outputDiv.appendChild(before0);
  outputDiv.appendChild(before);
  outputDiv.appendChild(target);
  outputDiv.appendChild(after);
  
  const lf = document.createElement('span');
  //lf.style.backgroundColor = "#151500";
  lf.appendChild(document.createTextNode("▐"));
  lf.style.color  = "#454545";
  outputDiv.appendChild(lf);
 
  const lineBreak = document.createElement('br');
  outputDiv.appendChild(lineBreak);
}

// Number of tabs at the beginni
function countTabsAtBeginning(inputString) {
  // Use a regular expression to match tabs at the beginning of the string
  //const matches = inputString.match(/^\t*/);
  const matches = inputString.match(/^\t*/);

  // If there are matches, return the length of the matched substring
  // Otherwise, return 0 indicating no tabs at the beginning
  return matches ? matches[0].length : 0;
}

// returns a string with the specified number of spaces. 
function generateSpaces(count) {
  return "_".repeat(count);
  //return "&nbsp;".repeat(count);
}


// 로컬 스토리지 수동으로 지우는 법 화면. https://postimg.cc/8sMqqsP4
function WriteLocalStorage() {
	let textarea = document.getElementById('code1');
	let cookieContent = textarea.value;
	// Store data in localStorage
	localStorage.setItem('code11', cookieContent);
}

function ReadLocalStorage() {
	let textarea = document.getElementById('code1');
	let storedData = localStorage.getItem('code11');
	textarea.value = storedData;
}

// 버튼으로 삭제하기
function removeItemFromLocalStorage(key = null) {
	if (null == key) {
		key = 'code11';
	}
	localStorage.removeItem(key);
}

	
