// CONSOLE.LOG()... 축약
const cl = (...args) => console.log(...args);


/**
함수들의 정의 라인 1줄씩 추출한다.
결과 예: ["function moveCaret2(posArr) {"]
*/
/* function extractFunctionDefinitions() {
  // Get the <textarea> element by its ID
  const textarea = document.getElementById('code1');

  if (textarea) {
    // Split the content of the textarea into lines
    const lines = textarea.value.split('\n');

    // Regular expression to match function definitions
    const functionRegex = /^(function\s+\w+\s*\(.+\)\s*{)/;

    const functionDefinitionLines = [];

    // Loop through each line and check for function definitions
    for (const line of lines) {
      const match = line.match(functionRegex);
      if (match) {
        // Add the entire line to the functionDefinitionLines array
        functionDefinitionLines.push(match[0]);
      }
    }

    return functionDefinitionLines;
  } else {
    // Handle the case where the 'code1' element is not found
    return null;
  }
} */

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
		  // cl(match[3], "a match114-3");
		  // cl(match[4], "a match114-4");
		  
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


/**
함수 호출 부만 찾아본다.
RESULT:
*/
/* function extractFunctionCalls() {
  // Get the <textarea> element by its ID
  const textarea = document.getElementById('code1');

  if (textarea) {
    // Split the content of the textarea into lines
    const lines = textarea.value.split('\n');

    // Regular expression to match function calls
    //const functionCallRegex = /(\w+)\s*\(/;
	const define1 = /(function)\s+\w+\(/g;
	const functionCallRegex = /\w+\s*\(.*\);/g;

    const functionCalls = [];

    // Loop through each line and check for function calls
    for (const line of lines) {
		// 함수 선언부는 제외.
	  const match1 = line.match(define1);
	  if (match1) {
		  const functionName1 = match1[0];
		  //console.log(functionName1, "제거");
		  continue;	// function 정의면 더이상 체크안함
	  }
	  
	  // 함수 호출부인지 체크
      const match2 = line.match(functionCallRegex);
      if (match2) {
        // Extract the function name
        const functionName = match2[0];
		console.log("호출부분: ", match2[0]);

        functionCalls.push(functionName);
      }
    }

    return functionCalls;
  } else {
    // Handle the case where the 'code1' element is not found
    return null;
  }
}

 */
 
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



// !!reg.exec[1]!!
// to reset for .exec call
/**
 * 함수 선언문들 찾기
 textarea 'code1'에서...
 */
/* function showFuncDefs() {
	const ret = extractFunctionNamesAndParameters();
	
	ret.forEach(item => {
	  console.log(`Function Name: ${item.functionName}`);
	  console.log('Parameters:');
	  item.parameters.forEach(param => {
		console.log(`  - ${param}`);
	  });
	  console.log('---');
	});	
} */


// 선택 안되는 것을 억지로 선택되게 하기 위한 또다른 함수.
function setCaretSel(textareaId, nn, n2) {
  let t1 = document.getElementById(textareaId); // usually CODE1
  t1.setSelectionRange(nn, nn); // Needed, to Scroll.
  t1.blur();  
  t1.focus();  
  //t1.setSelectionRange(nn, nn + n2);  
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
					//console.log('버튼임...',i);
					divElement.removeChild(divElement.children[i]);
				}
		}
	}
}

// 정한 수만큼 특정 문자로 이루어진 문자열 만들어 리턴.
function generateString(numberOfCharacters) {
  let string = "";
  for (let i = 0; i < numberOfCharacters; i++) {
    //string += "⬮"; 
	string += "▶";
  }
  if (numberOfCharacters == 0) {
	string = "🗍";
  }
	//debugger;

  return string;
}


// 라인 가기용 다이나믹 버튼 추가 
// extraValue : 줄 번호.
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
	} else {
		button.removeAttribute('class');
		button.classList.add('btnGotoNormal');
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
 

function generateSelectOptions(defOrLis) { // !!HTML_call
  // 리스너만 다시 테스트해본다
  let defs00 = null;
  
  if (defOrLis == 0)
	defs00 = extractFuncDefinitions();	// 여기서 Html 콜 여부도 체크해야...
  else
    defs00 = extractListenerDefinitions();	// 여기서 Html 콜 여부도 체크해야...
  

  if (!defs00) {
    console.error("Error: 'code1' element not found.");
    return;
  }

  // Create a <select> element
  const selectElement = document.createElement('select');
  selectElement.id = '함수 정의 목록 funcdeflist' + defOrLis;
  selectElement.size = 9;
  selectElement.style.width = 'auto';

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
	scrollToLineNumber('code1', lineNum-10); // LISTENER 목록에선, 이게 필요:바로 스크롤 한다.
	
	const calls1 = extractFunctionCallsWithLineNumbers();	//  모든 함수 호출 부분 모은 것
	console.log('콜스(소스내 모든 호출들)',calls1.length);	//// 'ham3();', 'ham4(a,b,c);' ham4(d,e,f)
	
	const ext_func_names = extractFunctionNames(calls1);
	
	//console.log(gFuncName1, " 찾고 있읍니다");
	//console.log(ext_func_names, " 에서요"); // 중복 함수명은 여러번 호출된다는 것을 말함.
	const indices1 = findStringOccurrences(ext_func_names, gFuncName1);

	// ** 아래는 대표 정의문에 딸린 반복문이 된다.
	// 함수 정의 리스트 박스에서 선택할 때마다 불리우므로, 각 인덱스마다 반복시엔 마지막 인덱스에 대한 함수 정보만 남게 된다.[이것이 문제. 계속 삭제(RESET)하게 됨]
	if (Array.isArray(indices1)) {
	  indices1.forEach(index => {
		//console.log(calls1[index]);

		const params1 = extractParameters(calls1[index]);
		const param_count = params1.length;		
		// 버튼에 맡기고 아래 정보는 표시하지 않는다. 길어지므로...
		//setTextInDiv('params1', calls1[index].functionName); //  함수 콜 하나씩 리스트한다
		//setTextInDiv('params1', calls1[index].lineNumber); //  함수 콜의 해당줄번호도 인쇄
		//setTextInDiv('params1', params1); // 파라메터만 보여 주느냐
		
		// @@ 주석포함 선언부일 수도 있다. 버튼에 흐린 글씨체로 넣어줄 수도 있다.

		// def2에 버튼도 만들어준다. @@ 에러가 안나는 이유?REMARK?에서?
	    add_GoButton(calls1[index].lineNumber, calls1[index].functionName, calls1[index].lineNumber, calls1[index].isRemark, param_count);
		
		// 입력 박스에 줄 번호를 넣어준다. 추후 외부 에디터로 사용 위함.
		//setGotoLine(calls1[index].lineNumber);

	  });
	} else {
		//resetTextInDiv('params1');	// DIV 글자 지우기
		
		//cl(typeof isHtmlCall, "CALL 2첵 ?");
		let msg2 = " ";//"Non-HTML";
		if (isHtmlCall) {
			msg2 = "그러나 !!HTML_call 입니다. ";
		}
		
		let msgRemark = "주석부는 아님.";
		if (isRemark) {
			msgRemark = "주석부입니다" + isRemark;
		}
		
		//const msg1 = lineNum+ ": 🚷 이 함수는 사용되지 않습니다."+gFuncName1+"' 🚷 FNF: Func NOT FOUND 893 " + msg2 + " 그리고 "+msgRemark;
		const msg1 = `${lineNum}: 🚷 이 함수는 사용되지 않습니다. ${gFuncName1}' 🚷 FNF: Func NOT FOUND 893 ${msg2} 그리고 ${msgRemark}`;
		
		//setTextInDiv('params1', "🚷 이 함수는 사용되지 않습니다 🚷 FNF: Func NOT FOUND 893 ");
		setTextInDiv('params1', msg1);
	}	
	
	
  });

  // Iterate through each function
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
}

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


// HTML CALL. 콜 버튼 클릭시.
function showCallsOfProcedure(fname1) {	// !!HTML_call
	const functionCalls = extractFunctionCalls();

	// Check if function calls were found
	if (functionCalls && functionCalls.length > 0) {
	  console.log('Calls:');
	  console.log(functionCalls.join(', '));
	} else {
	  console.log('No function calls found or textarea not found.');
	}	
	
	console.log(functionCalls[0]);
	console.log(":938",functionCalls[1]);
	//showFuncParams('hams2');
	const params1 = extractParameters(functionCalls[1]);
	console.log(params1, "parameters... :941:");
	
}

window.addEventListener("keydown", (e) => {
  //const key = document.getElementById(e.key);
  if (e.key === "F2") {
    alert("reset regs");
    resetRegs();
  }
  
});


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




// Example usage:
// const functionNamesInfo = extractFunctionNames();
// console.log(functionNamesInfo);


// Example usage:
// const functionCallStrings = ['ham4(a, b, c);', 'foo();', 'bar(x, y);'];
// const extractedFunctionNames = extractFunctionNames(functionCallStrings);
// console.log('Extracted Function Names:', extractedFunctionNames);

function arrayToString(array) {
  return array.join(', ');
}

// Example usage:
// const myArray = ['apple', 'banana', 'orange'];
// const resultString = arrayToString(myArray);
// console.log(resultString);


/*
함수 콜의 함수이름 중에서, 내가 찾는 함수이름이 있는지를 알려준다 
*/
/* function findString(array, targetString) {
  const index = array.indexOf(targetString);
  //return index !== -1 ? `String found at index ${index}` : 'String not found';
  return index;
}
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

/*
To get the line number at the caret's position in a textarea, you can use the selectionStart property of the textarea. Here's a function that does that:
*/
function getCaretLineNumber(id1) {
	//const textarea = document.getElementById('code1');
	const textarea = document.getElementById(id1);
	
	if (!textarea || !textarea instanceof HTMLTextAreaElement) {
		console.error('Invalid textarea element provided.');
		return -1;
	}

	const textBeforeCaret = textarea.value.substring(0, textarea.selectionStart);
	const lineBreaksBeforeCaret = textBeforeCaret.split('\n').length;

	//cl(lineBreaksBeforeCaret, 'lineBreaksBeforeCaret');
	return lineBreaksBeforeCaret;
}
