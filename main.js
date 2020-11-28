var file = document.getElementById('file');
var divDrop = document.getElementById('divDrop');
var buttonExecEffect = document.getElementById('execEffect');
var selectColorbit = document.getElementById('colorbit');
var selectOutputtype = document.getElementById('outtype');
var buttonDownLink = document.getElementById('buttonDownLink');
var buttonbig1 = document.getElementById('buttonbig1');
var buttonbig2 = document.getElementById('buttonbig2');

var canvas1 = document.getElementById('canvas1');
var canvas2 = document.getElementById('canvas2');
var canvas3 = document.createElement('canvas');
var canvasBig1 = false;
var canvasBig2 = false;
var originalImg = null;
var minSize = 1;

var uploadImgSrc = '';
var fileNameOrg = '';
var fileNameDownLink = '';
var saveType = '';
var saveImg1 = null;

var ctx1 = canvas1.getContext('2d');
var ctx2 = canvas2.getContext('2d');
var ctx3 = canvas3.getContext('2d');

function urlParameter() {
	let params = new URLSearchParams(document.location.search.substring(1));
	const bit = params.get('bit') - 0;
	const type = params.get('type');
	const view = params.get('view');
	if ((111 <= bit && bit <= 888) || bit == 999 || bit == 998){
		document.getElementById('colorbit').value = bit;
		if (bit == 999) {
			const br = params.get('br') - 0;
			const bg = params.get('bg') - 0;
			const bb = params.get('bb') - 0;
			if(br && bg && bb){
				document.getElementById('colorbitr').value = br;
				document.getElementById('colorbitg').value = bg;
				document.getElementById('colorbitb').value = bb;
			}
		}else if (bit == 998) {
			const cr = params.get('cr') - 0;
			const cg = params.get('cg') - 0;
			const cb = params.get('cb') - 0;
			if(cr && cg && cb){
				document.getElementById('countr').value = cr;
				document.getElementById('countg').value = cg;
				document.getElementById('countb').value = cb;
			}
		}
	}
	if (type == 'png' || type == 'jpeg' || type == 'webp' || type == 'bmp' || type == 'auto') {
		document.getElementById('outtype').value = type;
	}
	if (view == 'updown' || view == 'side') {
		document.getElementById('previewmode').value = view;
	}else{
		if (1000 < document.body.clientWidth ){
			document.getElementById('previewmode').value = 'side';
		}
	}
	let sname = params.get('sname');
	if (sname) {
		if (sname == 'none') {
			sname = '';
		}
		sname = sname.substr(0,30);
		document.getElementById('suffixName').value = sname;
	}
	let sdate = params.get('sdate');
	if(sdate == '1'){
		document.getElementById('suffixDate').checked = true;
	}else if(sdate == '0'){
		document.getElementById('suffixDate').checked = false;
	}
}

function setUrlParameter() {
	const bit = document.getElementById('colorbit').value;
	const type = document.getElementById('outtype').value;
	const view = document.getElementById('previewmode').value;
	const keys = 'bit=' + bit + '&type='+ type + '&view=' + view;
	let keybit = '';
	let keycount = '';
	if (bit == 999) {
		const br = document.getElementById('colorbitr').value;
		const bg = document.getElementById('colorbitg').value;
		const bb = document.getElementById('colorbitb').value;
		keybit = '&br=' + br + '&bg=' + bg + '&bb=' + bb;
	}else if (bit == 998) {
		const cr = document.getElementById('countr').value;
		const cg = document.getElementById('countg').value;
		const cb = document.getElementById('countb').value;
		keycount = '&cr=' + cr + '&cg=' + cg + '&cb=' + cb;
	}
	let sname = document.getElementById('suffixName').value;
	let keysuffix = '';
	if (sname != '_fix') {
		if (sname == ''){
			sname = 'none';
		}
		keysuffix = '&sname=' + encodeURIComponent(sname);
	}
	const filedate = document.getElementById('suffixDate').checked;
	let keydate = '';
	if (filedate) {
		keydate = '&sdate=1';
	}
	const params = keys + keybit + keycount + keysuffix + keydate;
	history.replaceState('', '', '?' + params);
}


function handleDrop(e) {
	e.stopPropagation();
	e.preventDefault();

	const files = e.dataTransfer.files;
	loadFile(files[0]);
}

function handleDragOver(e) {
	e.stopPropagation();
	e.preventDefault();
	e.dataTransfer.dropEffect = 'copy';
}

function changeColorBit() {
	const colorbit = document.getElementById('colorbit').value - 0;
	changeViewOptions('optionbit', colorbit == 999);
	changeViewOptions('optioncount', colorbit == 998);
	changeViewOptions('optionetc', colorbit == 998 || colorbit == 999);
	if (colorbit == 998) {
		const elemMode = document.getElementById('mode');
		const mode = elemMode.value;
		if (mode == 2 || mode == 3) {
			elemMode.value = 1;
		}
		document.getElementById('mode2').disabled = true;
		document.getElementById('mode3').disabled = true;
	} else {
		document.getElementById('mode2').disabled = false;
		document.getElementById('mode3').disabled = false;
	}
	setUrlParameter();
	execEffect();
}

function changeType() {
	const type = document.getElementById('outtype').value;
	if (type == 'png') {
		document.getElementById('outquality').disabled = true;
	} else {
		document.getElementById('outquality').disabled = false;
	}
}

function changeViewOptions(name, view) {
	const elem = document.getElementById(name);
	if (view) {
		elem.style.display = 'inline';
	} else {
		elem.style.display = 'none';
	}
}

function loadLocalImage(e) {
	const fileData = e.target.files[0];
	loadFile(fileData);
}

function loadFile(fileData) {
	buttonDownLink.disabled = true;
	buttonExecEffect.disabled = true;
	buttonbig1.disabled = true;
	buttonbig2.disabled = true;
	document.getElementById('saveFileName').innerText = '(無効)';
	if (!fileData.type.match('^image/.*')) {
		alert('画像を選択してください');
		return;
	}
	if (50 * 1024 * 1024 < fileData.size) {
		alert('画像のサイズは50MBまでです');
		return;
	}
	const org = document.getElementById('orgfileinfo');
	org.innerText = getStringFileSize(fileData.size);

	const reader = new FileReader();
	reader.onload = function () {
		uploadImgSrc = reader.result;
		fileNameOrg = fileData.name;
		const org = document.getElementById('orgfiletype');
		const index = uploadImgSrc.indexOf(';base64,');
		const header = uploadImgSrc.substr(0,100+index);
		const mime = header.substr(11, index - 11);
		const data = atob(header.substr(index + 8));
		let text = '';
		for(let i = 0; i < 15 && i < data.length; i++){
			text += ('0' + data.charCodeAt(i).toString(16)).slice(-2);
		}
		let strType = '';
		if (data.substr(0,8) == '\x89PNG\x0d\x0a\x1a\x0a') {
			strType = 'PNG';
		}else if (data.substr(0,4) == '\xff\xd8\xff\xe0' && data.substr(6,5) == 'JFIF\x00') {
			strType = 'JPEG(JFIF)';
		}else if (data.substr(0,4) == 'RIFF') {
			const format = data.substr(8,4);
			const fourCC = data.substr(12,4);
			if (format == 'WEBP'){
				strType = 'WebP';
				if (fourCC == 'VP8X') {
					strType += '(VP8X)';
				}else if (fourCC == 'VP8L') {
					strType += '(ロスレス)';
				}else if (fourCC == 'VP8 ') {
					strType += '(不可逆圧縮)';
				}else if (fourCC == 'ALPH') {
					strType += '(アルファチャネル)';
				}else{
					strType += '(不明FourCC[' + fourCC + '])';
				}
			}else{
				strType = '不明RIFF[' + format + '/' + fourCC + ']';
			}
		}else if (data.substr(0,3) == 'GIF') {
			strType = 'GIF';
		}else if (data.substr(0,2) == 'BM' && data.substr(6,4) == '\x00\x00\x00\x00') {
			strType = 'BMP(';
			let bitCount = '';
			if (data.substr(14,4) == '\x28\x00\x00\x00') {
				strType += 'Win';
				bitCount = data.substr(28, 2);
			} else if (data.substr(14,4) == '\x0c\x00\x00\x00') {
				strType += '0S2';
				bitCount = data.substr(24, 2);
			}
			if(bitCount == '\x18\x00') {
				strType += '24bit';
			}else if(bitCount == '\x20\x00') {
				strType += '32bit';
			}else if (bitCount == '\x08\x00') {
				strType += '8bit';
			}else if (bitCount == '\x04\x00') {
				strType += '4bit';
			}else if (bitCount == '\x01\x00') {
				strType += '1bit';
			}else{
				strType += '[' + (bitCount.charCodeAt(0) + bitCount.charCodeAt(1) * 256) + ']bit';
			}
			strType += ')';
		}else{
			strType = mime + '/' + '不明(hex:' + text + ')';
		}
		org.innerText = strType;

		canvasDraw();
	}
	reader.readAsDataURL(fileData);
}

function canvasDraw() {
	if (uploadImgSrc == '') {
		return;
	}
	const img = new Image();
	img.src = uploadImgSrc;
	img.crossOrigin = "Anonymous";
	img.onload = function () {
		const previewbr = document.getElementById('previewbr');
		if (document.getElementById('previewmode').value == 'updown') {
			if (previewbr.firstChild == undefined) {
				previewbr.appendChild(document.createElement('br'));
			}
			minSize = 1;
		}else{
			while (previewbr.firstChild){
				previewbr.removeChild(previewbr.firstChild);
			}
			minSize = 2;
		}

		originalImg = img;
		const preSize = getPreviewSize(img.width, img.height);
		canvas1.width = preSize.width;
		canvas1.height = preSize.height;
		canvas2.width = preSize.width;
		canvas2.height = preSize.height;
		canvas3.width = img.width;
		canvas3.height = img.height;
		canvasBig1= false;
		canvasBig2 = false;

		ctx3.clearRect(img, 0, 0, img.width, img.height);
		ctx3.drawImage(img, 0, 0, img.width, img.height);
		ctx2.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas2.width, canvas2.height);
		effectDownBits();

		const outImage = createDownData();
		const type = selectOutputType(fileNameOrg);
		saveType = type;
		if (type == 'jpeg' || type == 'webp'){
			saveImg1 = new Image();
			saveImg1.src = outImage;
			saveImg1.onload = function () {
				ctx1.drawImage(saveImg1, 0, 0, canvas3.width, canvas3.height, 0, 0, canvas1.width, canvas1.height);
				buttonElanble();
			}
		}else{
			saveImg1 = null;
			ctx1.drawImage(canvas3, 0, 0, canvas3.width, canvas3.height, 0, 0, canvas1.width, canvas1.height);
			buttonElanble();
		}
		fileNameDownLink = replaceFileName(fileNameOrg);
		const strSize = getStringFileSize(outImage.length * 3 / 4);
		document.getElementById('saveFileName').innerText = fileNameDownLink + ' (' + strSize + ')';
	}
}

function buttonElanble() {
	buttonDownLink.disabled = false;
	buttonExecEffect.disabled = false;
	buttonbig1.disabled = false;
	buttonbig2.disabled = false;
}

function getStringFileSize(size) {
	const length0 = parseInt(size);
	let unit = 'KB';
	let length1 = parseInt(length0 / 1024);
	let length2 = parseInt(length0 * 100 / 1024);
	length2 = length2 % 100;
	if (1024 * 1000 <= length0) {
		unit = 'MB';
		length1 = parseInt(length0 / (1024 * 1024));
		length2 = parseInt(length0 * 100 / (1024 * 1024));
		length2 = length2 % 100;
	}
	return length1 + '.' + length2 + unit;
}

function getPreviewSize(width, height){
	const maxSize = 450;
	const imageAspect = height / width;
	const w = document.body.clientWidth / minSize - 20;
	let retValue ={width:10, height:20};
	if (maxSize < w * imageAspect ) {
		retValue.width = (width / height) * maxSize;
		retValue.height = maxSize;
	}else if (maxSize < w ) {
		retValue.width = maxSize;
		retValue.height = maxSize * imageAspect;
	}else{
		retValue.width = w;
		retValue.height = w * imageAspect;
	}
	return retValue;
}

function clickButtonBig(e) {
	let target;
	let big;
	if (e.target.id == 'buttonbig1') {
		target = canvas1;
		big = canvasBig1;
	} else {
		target = canvas2;
		big = canvasBig2;
	}
	if (big) {
		if (target.id == 'canvas1') {
			canvasBig1 = false;
		} else {
			canvasBig2 = false;
		}
		const preSize = getPreviewSize(canvas3.width, canvas3.height);
		target.width = preSize.width;
		target.height = preSize.height;
	} else {
		if (target.id == 'canvas1') {
			canvasBig1 = true;
		} else {
			canvasBig2 = true;
		}
		const w = canvas3.width;
		target.width = canvas3.width;
		target.height = canvas3.height;
	}

	if (target.id == canvas1.id) {
		if (saveType == 'jpeg' || saveType == 'webp'){
			ctx1.drawImage(saveImg1, 0, 0, canvas3.width, canvas3.height, 0, 0, canvas1.width, canvas1.height);
		}else{
			ctx1.drawImage(canvas3, 0, 0, canvas3.width, canvas3.height, 0, 0, canvas1.width, canvas1.height);
		}
	} else {
		ctx2.drawImage(originalImg, 0, 0, canvas3.width, canvas3.height, 0, 0, canvas2.width, canvas2.height);
	}
}


function execEffect() {
	setUrlParameter();
	canvasDraw();
}

function effectDownBits() {
	const colorbit = document.getElementById('colorbit').value - 0;
	let mode = document.getElementById('mode').value - 0;
	const modeMax = 5;
	const modeText = ['不明', '最近傍法', '切り捨て', '切り上げ', '均等化', '切り下げ'];
	let bitRGB = new Array(3);
	if (888 == colorbit) {
		document.getElementById('saveMode').innerText = '(減色なし)';
		return;
	}
	if (mode <= 0 || modeMax < mode) {
		document.getElementById('saveMode').innerText = '(減色なし)不明なmode';
		return;
	}
	let errormode = false;
	const colorList = ['r', 'g', 'b'];
	for (let k = 0; k < 3; k++) {
		if (999 == colorbit) {
			bitRGB[k] = document.getElementById('colorbit' + colorList[k]).value - 0;
		} else {
			bitRGB[0] = parseInt(colorbit / 100 % 10);
			bitRGB[1] = parseInt(colorbit / 10 % 10);
			bitRGB[2] = parseInt(colorbit % 10);
		}
		if (998 == colorbit) {
			if(mode == 2 || mode == 3){
				mode = 1;
			}
		} else {
			if (bitRGB[k] <= 0 || 8 < bitRGB[k]) {
				errormode = true;
			}
		}
	}
	if (errormode) {
		document.getElementById('saveMode').innerText = '(減色なし)';
		alert('Info:RGB ' + bitRGB[0] + '/' + bitRGB[1] + '/' + bitRGB[2]);
		return;
	}

	let colorcount = new Array(3);
	const bits = function (k) {
		if (colorbit != 998) {
			colorcount[k] = Math.pow(2, bitRGB[k])
			return '' + bitRGB[k];
		}
		let elem = document.getElementById('count' + colorList[k]);
		let x = elem.value - 0;
		if (x <= 1) {
			x = 2;
		} else if (256 <= x) {
			x = 255;
		}
		elem.value = x;
		colorcount[k] = x;
		if (k == 2) {
			return x + '色数'
		}
		return x + ',';
	}

	const width = canvas3.width;
	const height = canvas3.height;
	let imageData = ctx3.getImageData(0, 0, width, height);
	let data = imageData.data;
	let t = new Uint8Array(256);
	for (let k = 0; k < 3; k++) {
		bitRGB[k] = bits(k);
		let c = colorcount[k];
		let d = c - 1;
		const maskAnd = 0xff & (0xff << (8 - bitRGB[k]));
		const maskOr = 0xff >> (bitRGB[k]);
		for (let i = 0; i < 256; i++) {
			if (mode == 1) {
				t[i] = Math.floor(Math.floor(i * d / 255.0 + 0.5) * 255 / d);
			} else if (mode == 2) {
				t[i] = i & maskAnd;
			} else if (mode == 3) {
				t[i] = i | maskOr;
			} else if (mode == 4) {
				t[i] = Math.floor(Math.floor(Math.min(i / 255.0 * c, d)) * 255 / d);
			} else if (mode == 5) {
				t[i] = Math.floor(Math.floor(i * d / 255.0) * 255 / d);
			}
		}
		for (let i = 0; i < height; i++) {
			let a = i * width * 4 + k;
			for (let j = 0; j < width; j++) {
				let index = j * 4 + a;
				data[index] = t[data[index]];
			}
		}
	}
	ctx3.putImageData(imageData, 0, 0);
	document.getElementById('saveMode').innerText
		= '(RGB' + bitRGB[0] + bitRGB[1] + bitRGB[2] + '/' + modeText[mode] + ')';
}

function createDownData() {
	const fileType = selectOutputType(fileNameOrg);
	const quality = parseFloat(document.getElementById('outquality').value);
	let data;
	let c = canvas3;
	if (fileType == 'png') {
		data = c.toDataURL();
	} else if (fileType == 'jpeg') {
		data = c.toDataURL('image/jpeg', quality);
	} else if (fileType == 'webp') {
		data = c.toDataURL('image/webp', quality);
	} else if (fileType == 'bmp') {
		data = c.toDataURL('image/bmp');
	} else {
		data = c.toDataURL();
	}
	return data;
}

function clickDownLink() {
	let data = createDownData();
	let downLink = document.createElement('a');
	downLink.href = data;
	downLink.download = fileNameDownLink;
	downLink.click();
}

function IsSuppertWebp() {
	let cnv = document.createElement("canvas");
	cnv.width = 10;
	cnv.height = 10;
	let data = cnv.toDataURL("image/webp", 0.1);
	return data.indexOf("image/webp") != -1;
}

function IsSuppertBmp() {
	let cnv = document.createElement("canvas");
	cnv.width = 10;
	cnv.height = 10;
	let data = cnv.toDataURL("image/bmp");
	return data.indexOf("image/bmp") != -1;
}

function isStringExtJpeg(ext) {
	return ext == '.jpeg' || ext == '.jpg' || ext == '.jpe';
}

function selectOutputType(name) {
	const dot = name.lastIndexOf('.');
	const outtype = document.getElementById('outtype').value;
	if (outtype == 'auto') {
		let ext = name.substr(dot);
		if (dot < 0) {
			ext = 'xxx';
		}
		const extLower = ext.toLowerCase();
		if (isStringExtJpeg(extLower)) {
			return 'jpeg';
		}
		if (extLower == '.png') {
			return 'png';
		}
		if (extLower == '.webp' && IsSuppertWebp()) {
			return 'webp';
		}
		if (extLower == '.bmp' && IsSuppertBmp()) {
			return 'bmp';
		}
		return 'png';
	}
	if (outtype == 'webp') {
		if (IsSuppertWebp()) {
			return 'webp';
		}
		return 'png';
	}
	if (outtype == 'bmp') {
		if (IsSuppertBmp()) {
			return 'bmp';
		}
		return 'png';
	}
	return outtype;
}

function replaceFileName(name) {
	const dot = name.lastIndexOf('.');
	let suffix = document.getElementById('suffixName').value;
	if (document.getElementById('suffixDate').checked) {
		suffix += getSuffixDate();
	}
	if (0 < dot) {
		const outtype = document.getElementById('outtype').value;
		const fileType = selectOutputType(name);
		let ext = name.substr(dot);
		const extLower = ext.toLowerCase();
		if (isStringExtJpeg(extLower) ||
			extLower == '.png' ||
			(extLower == '.webp' && IsSuppertWebp()) ||
			(extLower == '.bmp' && IsSuppertBmp())) {
			if (outtype == 'auto') {
				// not change
			} else if (outtype == 'jpeg') {
				if (!isStringExtJpeg(extLower)) {
					ext = '.jpeg';
				}
			} else if (outtype == 'png') {
				if (extLower != '.png') {
					ext = '.png';
				}
			} else if (outtype == 'webp') {
				if (extLower != '.webp') {
					ext = '.webp';
				}
			} else if (outtype == 'bmp') {
				if (extLower != '.bmp') {
					ext = '.bmp';
				}
			} else {
				ext = '.png';
			}
			return name.substr(0, dot) + suffix + ext;
		}
		return name.substr(0, dot) + suffix + '.' + fileType;
	} else if (0 == dot) {
		name = 'noname';
	}
	return name + suffix + '.' + selectOutputType(name);
}

function fixColumun2(d) {
	return ('00' + d).slice(-2);
}

function getSuffixDate() {
	const f = fixColumun2;
	const now = new Date();
	const d = '_' + now.getFullYear() + '-' + f(now.getMonth() + 1) + '-' + f(now.getDate()) + '_' + f(now.getHours()) + '-' + f(now.getMinutes()) + '-' + f(now.getSeconds());
	return d;
}

function removeUnsupportType() {
	const outtype = document.getElementById('outtype');
	const typebmp = document.getElementById('typebmp');
	const typewebp = document.getElementById('typewebp');
	if (typebmp && !IsSuppertBmp()) {
		outtype.removeChild(typebmp);
	}
	if (typewebp && !IsSuppertWebp()) {
		outtype.removeChild(typewebp);
	}
}

urlParameter();

file.addEventListener('change', loadLocalImage, false);
divDrop.addEventListener('drop', handleDrop, false);
divDrop.addEventListener('dragover', handleDragOver, false);
buttonExecEffect.addEventListener('click', execEffect, false);
selectColorbit.addEventListener('change', changeColorBit, false);
selectOutputtype.addEventListener('change', changeType, false);
buttonDownLink.addEventListener('click', clickDownLink, false);
buttonbig1.addEventListener('click', clickButtonBig, false);
buttonbig2.addEventListener('click', clickButtonBig, false);

changeColorBit();
changeType();
removeUnsupportType();
buttonExecEffect.disabled = true;
buttonDownLink.disabled = true;
buttonbig1.disabled = true;
buttonbig2.disabled = true;
