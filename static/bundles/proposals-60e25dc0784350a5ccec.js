/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./static/index/proposals.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./boards/templates/boards/proposals/proposals.jsx":
/*!*********************************************************!*\
  !*** ./boards/templates/boards/proposals/proposals.jsx ***!
  \*********************************************************/
/*! no exports provided */
/***/ (function(module, exports) {

eval("throw new Error(\"Module build failed (from ./node_modules/babel-loader/lib/index.js):\\nSyntaxError: E:\\\\Code\\\\PLXK\\\\boards\\\\templates\\\\boards\\\\proposals\\\\proposals.jsx: Expected corresponding JSX closing tag for <br>. (17:4)\\n\\n\\u001b[0m \\u001b[90m 15 |\\u001b[39m       \\u001b[33m<\\u001b[39m\\u001b[33mbr\\u001b[39m\\u001b[33m>\\u001b[39m\\u001b[33m--\\u001b[39m доступ людям \\u001b[33m-\\u001b[39m пошук усіх активних посад і якщо одна з них \\u001b[33m-\\u001b[39m підходяща\\u001b[33m,\\u001b[39m то доступ є\\u001b[0m\\n\\u001b[0m \\u001b[90m 16 |\\u001b[39m       \\u001b[33m<\\u001b[39m\\u001b[33mbr\\u001b[39m\\u001b[33m>\\u001b[39m\\u001b[33m--\\u001b[39m доступ\\u001b[33m:\\u001b[39m адміни\\u001b[33m,\\u001b[39m директор\\u001b[33m,\\u001b[39m \\u001b[33mЧобаня\\u001b[39m (посада\\u001b[33m?\\u001b[39m)\\u001b[33m,\\u001b[39m \\u001b[33mАртур\\u001b[39m (посада\\u001b[33m?\\u001b[39m)\\u001b[33m,\\u001b[39m начальник \\u001b[33mСОП\\u001b[39m\\u001b[0m\\n\\u001b[0m\\u001b[31m\\u001b[1m>\\u001b[22m\\u001b[39m\\u001b[90m 17 |\\u001b[39m     \\u001b[33m<\\u001b[39m\\u001b[33m/\\u001b[39m\\u001b[33mdiv\\u001b[39m\\u001b[33m>\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m    |\\u001b[39m     \\u001b[31m\\u001b[1m^\\u001b[22m\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m 18 |\\u001b[39m   )\\u001b[33m;\\u001b[39m\\u001b[0m\\n\\u001b[0m \\u001b[90m 19 |\\u001b[39m }\\u001b[0m\\n\\u001b[0m \\u001b[90m 20 |\\u001b[39m\\u001b[0m\\n    at instantiate (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:72:32)\\n    at constructor (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:358:12)\\n    at Object.raise (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:3341:19)\\n    at Object.jsxParseElementAt (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:7991:16)\\n    at Object.jsxParseElementAt (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:7953:32)\\n    at Object.jsxParseElementAt (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:7953:32)\\n    at Object.jsxParseElementAt (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:7953:32)\\n    at Object.jsxParseElement (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:8022:17)\\n    at Object.parseExprAtom (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:8036:19)\\n    at Object.parseExprSubscripts (E:\\\\Code\\\\PLXK\\\\node_modules\\\\@babel\\\\parser\\\\lib\\\\index.js:12643:23)\");\n\n//# sourceURL=webpack:///./boards/templates/boards/proposals/proposals.jsx?");

/***/ }),

/***/ "./static/index/proposals.js":
/*!***********************************!*\
  !*** ./static/index/proposals.js ***!
  \***********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var boards_templates_boards_proposals_proposals__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! boards/templates/boards/proposals/proposals */ \"./boards/templates/boards/proposals/proposals.jsx\");\n\n\n//# sourceURL=webpack:///./static/index/proposals.js?");

/***/ })

/******/ });