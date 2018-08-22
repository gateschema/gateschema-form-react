# gateschema-form-react  [![Build Status](https://travis-ci.org/GateSchema/gateschema-form-react.svg?branch=master)](https://travis-ci.org/GateSchema/gateschema-form-react)  [![Coverage Status](https://coveralls.io/repos/github/GateSchema/gateschema-form-react/badge.svg)](https://coveralls.io/github/GateSchema/gateschema-form-react)
A React component for generating forms from GateSchema.

## Features  
* GateSchema driven  
* Auto validation  
* Auto updating form data when user inputs value     
* Conditional fields  
* Able to change schema dynamically  
* Extendible, custom form component  


## Quick Start  
In this example use [antd](https://ant.design), and [stateform-antd](https://github.com/stateform/stateform-antd) as UI layer
```js  
// file: GateSchemaForm.js

// stateform implementation
import createStateForm from '@stateform/antd'
import "@stateform/iview/dist/stateform-antd.css"

import { createForm } from 'gateschema-form-react'

const StateForm = createStateForm({
  // stateform options
})
const GateSchemaForm = createForm({
  StateForm
})

export default GateSchemaForm

```

```js
// file: App.jsx
import React from 'react'
import _ from 'gateschema'
// your schema
const schema = _
  .required
  .map({
    name: _
      .required
      .string
      .notEmpty,
    gender: _
      .required
      .enum({
      MALE: 0,
      FEMALE: 1
    }),
  age: _
    .optional
    .number,
  intro: _
    .optional
    .string
    .other('form', {
      component: 'Textarea'
      // StateForm options
      // see https://github.com/stateform/StateForm-Specification
    })
})

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      schema,
      value: {}
    }
  }
  handleSubmit() {
    console.log(this.state.value)
  }
  render() {
    const {schema, value} = this.state
    return (
      <GateSchemaForm
        schema={schema}
        value={value}
      />
    )
  }
}

```  
**N.B.** As user fills the form, `GateSchemaForm` will mutate the properties of the passing `value` object. 

Using with redux  
```js
// store.js

import { formReducer } from 'gateschema-form-react'
import {createStore, combineReducers} from 'redux'

export default store = createStore(combineReducers({
  form: formReducer
}))

```

```js
// App.jsx
import React from 'react'
import {Provider} from 'react-redux'
import _ from 'gateschema'
import store from './store'
import GateSchemaForm from './GateSchemaForm'

const schema = _.map({
  //....
})

class App extends React.Component {
  handleSubmit() {
    console.log('submit')
  }
  render() {
    return (
      <Provider store={store}>
        <GateSchemaForm 
          name="myForm" 
          // now the form is binding to store.form.myForm
          schema={schema} 
          onSubmit={handleSubmit}
        >
        </GateSchemaForm>
      </Provider>
    )
  }
}

```

More Expamples on CodeSandbox  

## Install  
```
npm install gateschema-form-react --save  
``` 

## How it works
It transforms a [gateschema](https://github.com/GateSchema/gateschema-js) and the input value into a [StateForm](https://github.com/stateform/StateForm-Specification) state, and passes the state to a StateForm implementation 

## Usage  

Use the `other` keyword to pass your [StateForm](https://github.com/stateform/StateForm-Specification) options.  

Example  
```js  
const schema = _
  .require
  .map({
    name: _
      .require
      .map({
        firstName: _
          .required
          .string
          .notEmpty
          // StateForm options
          .other('form', {
            placeholder: 'First Name',
            help: 'Your first name',
            cols: {
              item: 6,
              label: 0,
              wrapper: 18
            }
          }),
        lastName: _
          .required
          .string
          .notEmpty
          // StateForm options
          .other('form', {
            placeholder: 'Last Name',
            cols: {
              item: 8,
              label: 0,
              wrapper: 24
            }
          })
      })
    languages: _
      .enumList({
        c: 0,
        java: 1,
        python: 2,
        go: 3,
        js: 4
      })
      // StateForm options
      .other({
        component: 'Select', 
        cols: {
          label: 6,
          wrapper: 18
        }
      })
  })

```

## Q&A  
### Custom validation ?  
This form component is GateSchema driven. You should define your GateSchema keyword for custom validations  
### Conditional fields ?  
Use `switch` keyword  
```js  
const schema = _
  .map({
    type: _
      .enum({
        TYPE1: 1,
        TYPE2: 2
      }),
    field0: _
      .optional
      .string
      .switch('/type', [
        {
          case: _.value(1),
          // hidden when type = 1
          schema: _
            .other('form', {
              hidden: true
            })
        },
        {
          case: _.any,
          schema: _.any
        }
      ])
  })
  .switch('/type', [
    {
      case: _.value(1),
      // have field1 when type = 1
      schema: _
        .map({
          field1: _
            .required
            .number
        })
    },
    {
      case: _.value(2),
      schema: _
        .map({
          field2: _
            .required
            .string
            .notEmpty
        })
    }
  ])
```

### Custom component ?  
Extend the StateForm implementation  

## License  
MIT