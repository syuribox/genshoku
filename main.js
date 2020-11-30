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
	const quo = params.get('quo');
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
		if (type == 'jpeg' || type == 'webp' || type == 'auto') {
			if (quo == '0.92' || quo == '1.0' || quo == '0.8' || quo == '0.7' || quo == '0.6' || quo == '0.5') {
				document.getElementById('outquality').value = quo;
			}
		}
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
	let keysquo = '';
	if (type == 'jpeg' || type == 'webp' || type == 'auto') {
		const quo = document.getElementById('outquality').value;
		keysquo = '&quo=' + quo;
	}
	const view = document.getElementById('previewmode').value;
	const keys = 'bit=' + bit + '&type='+ type + keysquo + '&view=' + view;
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


function dropHidden(){
	if (navigator.userAgent.match(/iPhone|Android.+Mobile/)){
		divDrop.style.display = 'none';
	}
}

function handleDrop(e) {
	e.stopPropagation();
	e.preventDefault();

	const files = e.dataTransfer.files;
	loadFile(files[0]);
	document.getElementById('orgfilename').innerText = files[0].name;
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

function charHex(str, index) {
	return ('0' + str.charCodeAt(index).toString(16)).slice(-2);
}

function loadFile(fileData) {
	buttonDownLink.disabled = true;
	buttonExecEffect.disabled = true;
	buttonbig1.disabled = true;
	buttonbig2.disabled = true;
	uploadImgSrc = '';
	fileNameOrg = '';
	document.getElementById('orgfilename').innerText = '';
	document.getElementById('saveFileName').innerText = '(無効)';
	const org = document.getElementById('orgfileinfo');
	org.innerText = getStringFileSize(fileData.size);
	if (!fileData.type.match('^image/.*')) {
		alert('画像を選択してください');
		loadError();
		return;
	}
	if (50 * 1024 * 1024 < fileData.size) {
		alert('画像のサイズは50MBまでです');
		loadError();
		return;
	}
	if(fileData.size == 0){
		loadError('空のファイルです');
		return;
	}

	const reader = new FileReader();
	reader.onload = function () {
		const org = document.getElementById('orgfiletype');
		const index = reader.result.indexOf(';base64,');
		if (index == -1) {
			org.innerText = '　';
			loadError();
			return;
		}
		uploadImgSrc = reader.result;
		fileNameOrg = fileData.name;
		org.innerText = getImageTypeByDataURL(uploadImgSrc);
		setUrlParameter();
		canvasDraw();
	}
	reader.readAsDataURL(fileData);
}

function getImageTypeByDataURL(orgBase64) {
	const index = orgBase64.indexOf(';base64,');
	if (index == -1) {
		return '';
	}
	const mime = orgBase64.substr(11, index - 11);
	const data = atob(orgBase64.substr(index + 8));
	let text = '';
	for(let i = 0; i < 6 && i < data.length; i++) {
		text += charHex(data, i);
	}
	let strType = '';
	if (data.substr(0,8) == '\x89PNG\x0d\x0a\x1a\x0a') {
		strType = 'PNG(';
		const depth = data.charCodeAt(24);
		const color = data.charCodeAt(25);
		let rgba = 0;
		if (color == 0) {
			strType += 'グレイ';
		}else if (color == 2) {
			strType += 'カラー';
			rgba = 3;
		}else if (color == 3) {
			strType += 'インデックス';
		}else if (color == 4) {
			strType += 'グレイアルファ';
			rgba = 2;
		}else if (color == 6) {
			strType += 'カラーアルファ';
			rgba = 4;
		}else {
			strType += '不明';
		}
		if (rgba) {
			strType += depth + 'bit[' + (depth * rgba) + 'bit])';
		}else{
			strType += depth + 'bit)';
		}
	}else if (data.substr(0,2) == '\xff\xd8') {
		strType = 'JPEG(';
		const tag = data.substr(2,2);
		var m = data.substr(6,5);
		if (tag == '\xff\xe0' && m == 'JFIF\x00') {
			strType += 'JFIF';
		}else if ('\xff\xe1' && m == 'Exif\x00') {
			strType += 'Exif';
		}else if (tag.charCodeAt(0) == 0xff && 0xe0 <= tag.charCodeAt(1) && tag.charCodeAt(1) <= 0xef) {
			strType += 'APP' + tag.charCodeAt(1);
		}else{
			strType += '不明';
		}
		let length = data.charCodeAt(4) * 256 + data.charCodeAt(5) + 4;
		let next = data.substr(length, 2);
		do {
			if (data.charCodeAt(length) != 0xff) {
				strType += '/不正値';
				break;
			}
			const marker = next.charCodeAt(1);
			// strType += '/' + charHex(next, 1);
			if (marker == 0xdb) {
			}else if (marker == 0xc0 || marker == 0xc2) {
				const ctype = data.substr(length + 9, 1);
				const mode = (marker == 0xc0 ? 'ベースライン' : 'プログレッシブ');
				strType += '/' + mode;
				if (ctype == '\x01') {
					strType += '/グレイ';
				}else if (ctype == '\x03') {
					strType += '/カラー';
				}else if (ctype == '\x04') {
					strType += '/CMYK';
				}else{
					strType += '/['+ charHex(type, 0) + ']';
				}
				break;
			}else if (0xc0 <= marker && marker <= 0xcf) {
				if (marker == 0xc4) {
					// DHT
				}else if (marker == 0xc8) {
					// JPG
				}else{
					strType += '/SOF' + marker;
				}
				break;
			}else if (0xe0 <= marker && marker <= 0xef) {
				// APP0 - APP15
				if (marker == 0xe1) {
					if (data.substr(length + 4,5) == 'Exif\x00') {
						strType += '/Exif';
					}
				}
			}else if (marker == 0xfe) {
				// コメント
			}else{
				// strType += '/不明[ff' + charHex(next, 1) + ']';
			}
			length = data.charCodeAt(length + 2)* 256 + data.charCodeAt(length + 3) + length + 2;
			next = data.substr(length, 2);
		} while(length < data.length);
		strType += ')';
	}else if (data.substr(0,4) == 'RIFF') {
		const format = data.substr(8,4);
		const fourCC = data.substr(12,4);
		if (format == 'WEBP') {
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
		const bytes = data.substr(14,4);
		const b = bytes.charCodeAt(0);
		if (bytes == '\x28\x00\x00\x00') {
			strType += 'Win/';
			bitCount = data.substr(28, 2);
		} else if (bytes == '\x0c\x00\x00\x00') {
			strType += '0S2/';
			bitCount = data.substr(24, 2);
		} else if (bytes.substr(1, 3) == '\x00\x00\x00') { 
			if (b == 52 || b == 56 || b == 60 || b == 96 || b == 108) {
				bitCount = data.substr(28, 2);
				strType += 'V4/';
			} else if (b == 112 || b == 120 || b == 124) {
				bitCount = data.substr(28, 2);
				strType += 'V5/';
			}else{
				strType += '不明';
			}
		}
		if (bitCount == '\x18\x00') {
			strType += '24bit';
		}else if (bitCount == '\x20\x00') {
			strType += '32bit';
		}else if (bitCount == '\x08\x00') {
			strType += '8bit';
		}else if (bitCount == '\x04\x00') {
			strType += '4bit';
		}else if (bitCount == '\x01\x00') {
			strType += '1bit';
		}else if (bitCount == '\x00\x00') {
			if (data.substr(30,4) == '\x04\x00\x00\x00') {
				strType += 'JPEG';
			}else if (data.substr(30,4) == '\x05\x00\x00\x00') {
				strType += 'PNG';
			}else{
				strType += '0bit';
			}
		}else if(bitCount == '') {
			// strType += 'bit数不明';
		}else{
			strType += '[' + (bitCount.charCodeAt(0) + bitCount.charCodeAt(1) * 256) + ']bit';
		}
		strType += ')';
	}else if (data.substr(4,8) == 'ftypavif') {
		strType = 'AVIF';
	}else{
		strType = mime + '/' + '不明(hex:' + text + ')';
	}
	return strType;
}

function canvasDraw() {
	if (uploadImgSrc == '') {
		return;
	}
	const img = new Image();
	img.crossOrigin = 'anonymous';
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

		ctx3.clearRect(0, 0, img.width, img.height);
		ctx3.drawImage(img, 0, 0, img.width, img.height);
		ctx2.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas2.width, canvas2.height);
		const type = selectOutputType(fileNameOrg);
		let quo = '';
		if( type == 'jpeg' || type == 'webp' ){
			quo = '/品質' + document.getElementById('outquality').value;
		}
		const effect = '(' + effectDownBits() + quo + ')';
		document.getElementById('saveMode').innerText = effect;

		const outImage = createDownData();
		saveType = type;
		if (type == 'jpeg' || type == 'webp' || type == 'avif'){
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
		document.getElementById('saveFileName').innerText = fileNameDownLink;
		document.getElementById('saveFileSize').innerText = '(' + strSize + ')';
		document.getElementById('imagesize').innerText = canvas3.width + ' x ' + canvas3.height;
	}
	img.onerror = handlerLoadError;
	img.src = uploadImgSrc;
}

function handlerLoadError() {
	loadError();
}

function loadError(str) {
	canvas1.width = 10;
	canvas1.height = 10;
	canvas2.width = 10;
	canvas2.height = 10;
	canvas3.width = 10;
	canvas3.height = 10;
	ctx1.clearRect(0, 0, 10, 10);
	ctx2.clearRect(0, 0, 10, 10);
	ctx3.clearRect(0, 0, 10, 10);
	if(str){
		str = '/' + str;
	}else{
		str = '';
	}
	document.getElementById('saveMode').innerText = '(読み込みエラー' + str + ')';
	document.getElementById('saveFileName').innerText = '　';
	document.getElementById('saveFileSize').innerText = '　';
	document.getElementById('imagesize').innerText = '　';
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
		return '減色なし';
	}
	if (mode <= 0 || modeMax < mode) {
		return '減色なし/不明なmode';
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
		return '減色なし/' +
			'error:RGB[' + bitRGB[0] + '/' + bitRGB[1] + '/' + bitRGB[2] + ']';
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
	return 'RGB' + bitRGB[0] + bitRGB[1] + bitRGB[2] + '/' + modeText[mode] + '';
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

function IsSuppertImage(type) {
	let cnv = document.createElement('canvas');
	cnv.width = 10;
	cnv.height = 10;
	const mime = 'image/' + type;
	let data = cnv.toDataURL(mime, 0.1);
	return data.indexOf(mime) != -1;
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
		if (extLower == '.webp' && IsSuppertImage('webp')) {
			return 'webp';
		}
		if (extLower == '.bmp' && IsSuppertImage('bmp')) {
			return 'bmp';
		}
		if (extLower == '.avif' && IsSuppertImage('avif')) {
			return 'avif';
		}
		return 'png';
	}
	const exts = ['webp', 'bmp', 'avif'];
	for(let i = 0; i < exts.length; i++){
		const ext = exts[i];
		if (outtype == ext) {
			if (IsSuppertImage(ext)) {
				return ext;
			}
			return 'png';
		}
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
			(extLower == '.webp' && IsSuppertImage('wabp')) ||
			(extLower == '.bmp' && IsSuppertImage('bmp')) ||
			(extLower == '.avif' && IsSuppertImage('avif'))) {
			if (outtype == 'auto') {
				// not change
			} else if (outtype == 'jpeg') {
				if (!isStringExtJpeg(extLower)) {
					ext = '.jpeg';
				}
			} else {
				const exts = ['png', 'webp', 'bmp', 'avif', 'xxx'];
				for(let i = 0; i < exts.length; i++){
					const ext = exts[i];
					if (outtype == ext) {
						if (extLower != '.' + ext) {
							ext = '.' + ext;
						}
						break;
					}
					if (ext == 'xxx'){
						ext = '.png';
					}
				}
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
	const typeavif = document.getElementById('typeavif');
	if (typebmp && !IsSuppertImage('bmp')) {
		outtype.removeChild(typebmp);
	}
	if (typewebp && !IsSuppertImage('webp')) {
		outtype.removeChild(typewebp);
	}
	if (typeavif && !IsSuppertImage('avif')) {
		outtype.removeChild(typeavif);
	}
}

urlParameter();
dropHidden();

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
