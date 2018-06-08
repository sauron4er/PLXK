/*!
 * react-gridforms 1.0.2 - https://github.com/insin/react-gridforms
 * MIT Licensed
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"));
	else if(typeof define === 'function' && define.amd)
		define(["react"], factory);
	else if(typeof exports === 'object')
		exports["GridForms"] = factory(require("react"));
	else
		root["GridForms"] = factory(root["React"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_2__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

	__webpack_require__(1);

	var _react = __webpack_require__(2);

	var _react2 = _interopRequireDefault(_react);

	var classNames = function classNames() {
	  for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	    args[_key] = arguments[_key];
	  }

	  return args.filter(function (cn) {
	    return !!cn;
	  }).join(' ');
	};

	var GridForm = _react2['default'].createClass({
	  displayName: 'GridForm',

	  getDefaultProps: function getDefaultProps() {
	    return {
	      component: 'form',
	      custom: false
	    };
	  },
	  render: function render() {
	    var _props = this.props;
	    var children = _props.children;
	    var className = _props.className;
	    var Component = _props.component;
	    var custom = _props.custom;

	    var props = _objectWithoutProperties(_props, ['children', 'className', 'component', 'custom']);

	    return _react2['default'].createElement(
	      Component,
	      _extends({}, props, { className: classNames(!custom && 'grid-form', className) }),
	      children
	    );
	  }
	});

	exports.GridForm = GridForm;
	var Fieldset = _react2['default'].createClass({
	  displayName: 'Fieldset',

	  render: function render() {
	    var _props2 = this.props;
	    var children = _props2.children;
	    var legend = _props2.legend;

	    var props = _objectWithoutProperties(_props2, ['children', 'legend']);

	    return _react2['default'].createElement(
	      'fieldset',
	      props,
	      legend && _react2['default'].createElement(
	        'legend',
	        null,
	        legend
	      ),
	      children
	    );
	  }
	});

	exports.Fieldset = Fieldset;
	var Row = _react2['default'].createClass({
	  displayName: 'Row',

	  render: function render() {
	    var _props3 = this.props;
	    var children = _props3.children;

	    var props = _objectWithoutProperties(_props3, ['children']);

	    var span = 0;
	    _react.Children.forEach(children, function (child) {
	      return span += Number(child.props.span);
	    });
	    return _react2['default'].createElement(
	      'div',
	      _extends({}, props, { 'data-row-span': span }),
	      children
	    );
	  }
	});

	exports.Row = Row;
	var Field = _react2['default'].createClass({
	  displayName: 'Field',

	  propTypes: {
	    span: _react.PropTypes.oneOfType([_react.PropTypes.number, _react.PropTypes.string])
	  },
	  getDefaultProps: function getDefaultProps() {
	    return {
	      span: 1
	    };
	  },
	  render: function render() {
	    var _props4 = this.props;
	    var children = _props4.children;
	    var span = _props4.span;

	    var props = _objectWithoutProperties(_props4, ['children', 'span']);

	    return _react2['default'].createElement(
	      'div',
	      _extends({}, props, { 'data-field-span': span }),
	      children
	    );
	  }
	});
	exports.Field = Field;

/***/ },
/* 1 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_2__;

/***/ }
/******/ ])
});
;