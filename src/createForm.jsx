import React, {Component} from 'react'
import PropTypes from 'prop-types'
import defaultTransformer from 'gateschema-transformer'

function debounce(func, wait) {
  let tId
  return function() {
    clearTimeout(tId)
    tId = setTimeout(() => {
      tId = null
      func.apply(this, arguments)
    }, wait)
  }
}

export function createForm(options = {}) {
  const { StateForm, transformer = defaultTransformer } = options

  class GateSchemaForm extends Component {
    static contextTypes = {
      store: PropTypes.object
    }
    static propTypes = {
      schema: PropTypes.object.isRequired,
      value: PropTypes.any,
      name: PropTypes.string,
      debounce: PropTypes.number,
      ignoreErrors: PropTypes.object
    }
    constructor(props, context) {
      super(props, context)
      const {schema, value, name, debounce }  = props

      this.cache = {}
      this.errors = []
      this.activePaths = {}
      this.validationOptions = {
          skipAsync: true
      }
      this.pathValidationOptions = {}

      this.state = {
        schema: schema,
        value: value,
        formState: null
      }

      this.setValueOfFormPath = name 
        ? this.setValueOfFormPathViaRedux 
        : this.setValueOfFormPathDirectly

      this.renderSchemaDebounced = debounce 
        ? debounce(this.renderSchema, debounce) 
        : this.renderSchema

      if (props.schema) {
        this.renderSchema()
      }
    }
    setValueOfFormPathDirectly(path, value, parentValue, key) {
      parentValue[key] = value
    }
    setValueOfFormPathViaRedux(path, value, parentValue, key) {
      this.context.store.dispatch({
        type: 'GATESCHEMA_FORM_INPUT_OF_PATH',
        payload: {
          name: this.props.name,
          path,
          value,
          parentValue,
          key
        }
      })
    }
    transformNode = (node, parentNode) => {
      const {activePaths} = this
      const {ignoreErrors} = this.props
      const {path, error, value, constraints} = node
      const {type, other = {}} = constraints
      const form = other.form || {}

      if (form.hidden) {
        return
      }
      let errorMsg

      // collect error
      if (error && !ignoreErrors[error.keyword]) {
        this.errors.push([path, error])
        errorMsg = error.msg
      }

      const formItem =  Object.assign({}, form, {
        path,
        required: constraints.required,
        error: (activePaths[path] && errorMsg) || undefined,
        value,
        children: node.children,
        option: constraints.option
      })


      const componentMap = {
        list: 'List',
        map: 'Map',
        string: 'Input',
        number: 'InputNumber',
        boolean: 'Switch',
        enumList: 'Checkbox',
        enum: 'Radio'
      }

      let component = formItem.component || (path === '/' ? 'Form' :  componentMap[type])


      if (component === 'Select' && type === 'enumList') {
        formItem.multiple = true
      }

      if (!formItem.label && parentNode && parentNode.constraints.type !== 'list') {
        formItem.label = path.slice(path.lastIndexOf('/') + 1)
      }

      formItem.component = component

      this.cache[path] = {
        type,
        item: formItem
      }
      return formItem
    }
    setFormState(formState) {
      const state = this.state
      const {schema, value} = state
      if (state.formState == null) {
        this.state = {
          schema,
          value,
          formState
        }
      } else {
        this.setState({
          schema,
          value,
          formState
        })
      }
    }
    updateValue(path, value, noDebounce) {
      const rootData = this.props.value
      const keys = path.split('/').slice(1)
      const length = keys.length
      if (length === 0) {
        return this.setValueOfFormPath('/', value)
      }
      let target = rootData || {}
      if (target !== rootData) {
        this.setValueOfFormPath('/', target)
      }

      const lastIndex = length - 1
      let currentPath = ''
      for(let i = 0; i < length; i++) {
        const key = keys[i]
        currentPath += ('/' + key)
        if (i < lastIndex) {
          let child = target[key]
          if (child == null || typeof child !== 'object') {
            child = this.cache[currentPath].type === 'list' ? [] : {}
            this.setValueOfFormPath(currentPath, child, target, key)
          }
          target = child
        } else {
          this.setValueOfFormPath(currentPath, value, target, key)
        }
      }
      return noDebounce ? this.renderSchema() : this.renderSchemaDebounced()
    }
    handleUserInput = (path, value, index) => {
      let noDebounce = false
      const type = this.cache[path].type
      if (type === 'string' && value === '') {
        value = undefined
      } else if (type === 'list') {
        noDebounce = true
        if (typeof index !== 'undefined') {
          const activePaths = this.activePaths
          const newActivePaths = {}
          const activePathsOfOldValue = []
          const prefix = path + '/'
          Object.keys(activePaths).forEach(key => {
            if (key.indexOf(prefix) === 0) {
              activePathsOfOldValue.push(key)
            } else {
              newActivePaths[key] = true
            }
          })
          const regex = new RegExp('^' + path + '\\/(\\d)(\\/.*)?')
          let match
          let idx
          let appendix
          activePathsOfOldValue.forEach(oldKey => {
            match = oldKey.match(regex)
            idx = ~~match[1]
            appendix = match[2] || ''
            if (idx < index) {
              newActivePaths[oldKey] = true
            } else if (idx > index) {
              newActivePaths[prefix + (idx - 1) + appendix] = true
            }
          })
          this.activePaths = newActivePaths
        }
      }
      this.activePaths[path] = true
      this.pathValidationOptions = {
        [path]: {
          skipAsync: false
        }
      }
      this.updateValue(path, value, noDebounce)
    }
    handleSubmit = () => {
      const activePaths = this.activePaths
      Object.keys(this.cache).forEach(key => {
        activePaths[key] = true
      })
      this.renderSchema(() => {
        if (this.errors.length === 0) {
          this.props.onSubmit()
        }
      })
    }
    handleReset() {
      this.props.onReset()
    }
    renderSchema = (cb) => {
      const {value, schema} = this.state
      this.errors = []
      this.cache = {}
      const options = {
        path: '/',
        value: value,
        rootData: value,
        validationOptions: this.validationOptions,
        pathValidationOptions: this.pathValidationOptions,
        transform: this.transformNode,
      }
      transformer.transform(schema, options, (formState) => {
        this.setFormState(formState)
        return cb && cb()
      })
    }
    componentWillReceiveProps(nextProps) {
      const props = this.props
      const {value, schema} = nextProps
      if (props.value !== value || props.schema !== schema) {
        this.setState({
          value: value,
          schema: schema,
          formState: this.state.formState
        })
        this.renderSchema()
      }
    }
    shouldComponentUpdate(nextProps, nextState) {
      if (this.state.formState === nextState.formState) {
        return fasle
      } 
      return true
    }
    render() {
      const {handleSubmit, handleReset, handleUserInput, children} = this
      const {formState} = this.state
      return <StateForm 
        state={formState} 
        onSubmit={handleSubmit}
        onReset={handleReset}
        onInput={handleUserInput}
      >
        {children}
      </StateForm>
    }
    created() {
      if (this.name) {
        const name = this.name
        const mutationsName = vuexModuleName + '/setValueOfFormPath'
        this.setValueOfFormPath = function(path, value, parentValue, key) {
          this.$store.commit(mutationsName, {
            name,
            path,
            value,
            parentValue,
            key
          })
        }
      }

      this.$watch('schema', {
        deep: this.isDeepWatchSchema,
        handler: this.renderSchema
      })

      this.renderSchemaDebounced = this.debounce 
        ? debounce(this.renderSchema, this.debounce) 
        : this.renderSchema
      
      if (this.schema) {
        this.renderSchemaDebounced()
      }
    }
  }
  GateSchemaForm.defaultProps = {
    ignoreErrors: {
      map: true,
      list: true
    }
  }

  return GateSchemaForm
}

export default createForm
