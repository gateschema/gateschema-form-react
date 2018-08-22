'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var PropTypes = _interopDefault(require('prop-types'));
var defaultTransformer = _interopDefault(require('gateschema-transformer'));

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function debounce(func, wait) {
  var tId;
  return function () {
    var _this = this,
        _arguments = arguments;

    clearTimeout(tId);
    tId = setTimeout(function () {
      tId = null;
      func.apply(_this, _arguments);
    }, wait);
  };
}

function createForm() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var StateForm = options.StateForm,
      _options$transformer = options.transformer,
      transformer = _options$transformer === void 0 ? defaultTransformer : _options$transformer;

  var GateSchemaForm =
  /*#__PURE__*/
  function (_Component) {
    _inherits(GateSchemaForm, _Component);

    function GateSchemaForm(props, context) {
      var _this2;

      _classCallCheck(this, GateSchemaForm);

      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(GateSchemaForm).call(this, props, context));

      _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "transformNode", function (node, parentNode) {
        var _assertThisInitialize = _assertThisInitialized(_assertThisInitialized(_this2)),
            activePaths = _assertThisInitialize.activePaths;

        var ignoreErrors = _this2.props.ignoreErrors;
        var path = node.path,
            error = node.error,
            value = node.value,
            constraints = node.constraints;
        var type = constraints.type,
            _constraints$other = constraints.other,
            other = _constraints$other === void 0 ? {} : _constraints$other;
        var form = other.form || {};

        if (form.hidden) {
          return;
        }

        var errorMsg; // collect error

        if (error && !ignoreErrors[error.keyword]) {
          _this2.errors.push([path, error]);

          errorMsg = error.msg;
        }

        var formItem = Object.assign({}, form, {
          path: path,
          required: constraints.required,
          error: activePaths[path] && errorMsg || undefined,
          value: value,
          children: node.children,
          option: constraints.option
        });
        var componentMap = {
          list: 'List',
          map: 'Map',
          string: 'Input',
          number: 'InputNumber',
          boolean: 'Switch',
          enumList: 'Checkbox',
          enum: 'Radio'
        };
        var component = formItem.component || (path === '/' ? 'Form' : componentMap[type]);

        if (component === 'Select' && type === 'enumList') {
          formItem.multiple = true;
        }

        if (!formItem.label && parentNode && parentNode.constraints.type !== 'list') {
          formItem.label = path.slice(path.lastIndexOf('/') + 1);
        }

        formItem.component = component;
        _this2.cache[path] = {
          type: type,
          item: formItem
        };
        return formItem;
      });

      _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "handleUserInput", function (path, value, index) {
        var noDebounce = false;
        var type = _this2.cache[path].type;

        if (type === 'string' && value === '') {
          value = undefined;
        } else if (type === 'list') {
          noDebounce = true;

          if (typeof index !== 'undefined') {
            var activePaths = _this2.activePaths;
            var newActivePaths = {};
            var activePathsOfOldValue = [];
            var prefix = path + '/';
            Object.keys(activePaths).forEach(function (key) {
              if (key.indexOf(prefix) === 0) {
                activePathsOfOldValue.push(key);
              } else {
                newActivePaths[key] = true;
              }
            });
            var regex = new RegExp('^' + path + '\\/(\\d)(\\/.*)?');
            var match;
            var idx;
            var appendix;
            activePathsOfOldValue.forEach(function (oldKey) {
              match = oldKey.match(regex);
              idx = ~~match[1];
              appendix = match[2] || '';

              if (idx < index) {
                newActivePaths[oldKey] = true;
              } else if (idx > index) {
                newActivePaths[prefix + (idx - 1) + appendix] = true;
              }
            });
            _this2.activePaths = newActivePaths;
          }
        }

        _this2.activePaths[path] = true;
        _this2.pathValidationOptions = _defineProperty({}, path, {
          skipAsync: false
        });

        _this2.updateValue(path, value, noDebounce);
      });

      _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "handleSubmit", function () {
        var activePaths = _this2.activePaths;
        Object.keys(_this2.cache).forEach(function (key) {
          activePaths[key] = true;
        });

        _this2.renderSchema(function () {
          if (_this2.errors.length === 0) {
            _this2.props.onSubmit();
          }
        });
      });

      _defineProperty(_assertThisInitialized(_assertThisInitialized(_this2)), "renderSchema", function (cb) {
        var _this2$state = _this2.state,
            value = _this2$state.value,
            schema = _this2$state.schema;
        _this2.errors = [];
        _this2.cache = {};
        var options = {
          path: '/',
          value: value,
          rootData: value,
          validationOptions: _this2.validationOptions,
          pathValidationOptions: _this2.pathValidationOptions,
          transform: _this2.transformNode
        };
        transformer.transform(schema, options, function (formState) {
          _this2.setFormState(formState);

          return cb && cb();
        });
      });

      var _schema = props.schema,
          _value = props.value,
          name = props.name,
          debounce = props.debounce;
      _this2.cache = {};
      _this2.errors = [];
      _this2.activePaths = {};
      _this2.validationOptions = {
        skipAsync: true
      };
      _this2.pathValidationOptions = {};
      _this2.state = {
        schema: _schema,
        value: _value,
        formState: null
      };
      _this2.setValueOfFormPath = name ? _this2.setValueOfFormPathViaRedux : _this2.setValueOfFormPathDirectly;
      _this2.renderSchemaDebounced = debounce ? debounce(_this2.renderSchema, debounce) : _this2.renderSchema;

      if (props.schema) {
        _this2.renderSchema();
      }

      return _this2;
    }

    _createClass(GateSchemaForm, [{
      key: "setValueOfFormPathDirectly",
      value: function setValueOfFormPathDirectly(path, value, parentValue, key) {
        parentValue[key] = value;
      }
    }, {
      key: "setValueOfFormPathViaRedux",
      value: function setValueOfFormPathViaRedux(path, value, parentValue, key) {
        this.context.store.dispatch({
          type: 'GATESCHEMA_FORM_INPUT_OF_PATH',
          payload: {
            name: this.props.name,
            path: path,
            value: value,
            parentValue: parentValue,
            key: key
          }
        });
      }
    }, {
      key: "setFormState",
      value: function setFormState(formState) {
        var state = this.state;
        var schema = state.schema,
            value = state.value;

        if (state.formState == null) {
          this.state = {
            schema: schema,
            value: value,
            formState: formState
          };
        } else {
          this.setState({
            schema: schema,
            value: value,
            formState: formState
          });
        }
      }
    }, {
      key: "updateValue",
      value: function updateValue(path, value, noDebounce) {
        var rootData = this.props.value;
        var keys = path.split('/').slice(1);
        var length = keys.length;

        if (length === 0) {
          return this.setValueOfFormPath('/', value);
        }

        var target = rootData || {};

        if (target !== rootData) {
          this.setValueOfFormPath('/', target);
        }

        var lastIndex = length - 1;
        var currentPath = '';

        for (var i = 0; i < length; i++) {
          var key = keys[i];
          currentPath += '/' + key;

          if (i < lastIndex) {
            var child = target[key];

            if (child == null || _typeof(child) !== 'object') {
              child = this.cache[currentPath].type === 'list' ? [] : {};
              this.setValueOfFormPath(currentPath, child, target, key);
            }

            target = child;
          } else {
            this.setValueOfFormPath(currentPath, value, target, key);
          }
        }

        return noDebounce ? this.renderSchema() : this.renderSchemaDebounced();
      }
    }, {
      key: "handleReset",
      value: function handleReset() {
        this.props.onReset();
      }
    }, {
      key: "componentWillReceiveProps",
      value: function componentWillReceiveProps(nextProps) {
        var props = this.props;
        var value = nextProps.value,
            schema = nextProps.schema;

        if (props.value !== value || props.schema !== schema) {
          this.setState({
            value: value,
            schema: schema,
            formState: this.state.formState
          });
          this.renderSchema();
        }
      }
    }, {
      key: "shouldComponentUpdate",
      value: function shouldComponentUpdate(nextProps, nextState) {
        if (this.state.formState === nextState.formState) {
          return fasle;
        }

        return true;
      }
    }, {
      key: "render",
      value: function render() {
        var handleSubmit = this.handleSubmit,
            handleReset = this.handleReset,
            handleUserInput = this.handleUserInput,
            children = this.children;
        var formState = this.state.formState;
        return React__default.createElement(StateForm, {
          state: formState,
          onSubmit: handleSubmit,
          onReset: handleReset,
          onInput: handleUserInput
        }, children);
      }
    }, {
      key: "created",
      value: function created() {
        if (this.name) {
          var name = this.name;
          var mutationsName = vuexModuleName + '/setValueOfFormPath';

          this.setValueOfFormPath = function (path, value, parentValue, key) {
            this.$store.commit(mutationsName, {
              name: name,
              path: path,
              value: value,
              parentValue: parentValue,
              key: key
            });
          };
        }

        this.$watch('schema', {
          deep: this.isDeepWatchSchema,
          handler: this.renderSchema
        });
        this.renderSchemaDebounced = this.debounce ? debounce(this.renderSchema, this.debounce) : this.renderSchema;

        if (this.schema) {
          this.renderSchemaDebounced();
        }
      }
    }]);

    return GateSchemaForm;
  }(React.Component);

  _defineProperty(GateSchemaForm, "contextTypes", {
    store: PropTypes.object
  });

  _defineProperty(GateSchemaForm, "propTypes", {
    schema: PropTypes.object.isRequired,
    value: PropTypes.any,
    name: PropTypes.string,
    debounce: PropTypes.number,
    ignoreErrors: PropTypes.object
  });

  GateSchemaForm.defaultProps = {
    ignoreErrors: {
      map: true,
      list: true
    }
  };
  return GateSchemaForm;
}

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var action = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var type = action.type,
      payload = action.payload;

  if (type === 'GATESCHEMA_FORM_INPUT_OF_PATH') {
    var name = payload.name,
        path = payload.path,
        value = payload.value,
        parentValue = payload.parentValue,
        key = payload.key;

    if (path === '/') {
      return Object.assign({}, state, _defineProperty({}, name, value));
    } else {
      parentValue[key] = value;
      return Object.assign({}, state);
    }
  }

  return state;
}

exports.transformer = defaultTransformer;
exports.createForm = createForm;
exports.formReducer = reducer;
//# sourceMappingURL=index.js.map
