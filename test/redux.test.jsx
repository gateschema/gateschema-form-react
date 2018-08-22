import React from 'react'
import renderer from 'react-test-renderer';

import {Provider} from 'react-redux'
import {createStore, combineReducers} from 'redux'

import _ from 'gateschema'
import transformer from 'gateschema-transformer'

import {createForm, formReducer} from '../src/index.js'
import { createMockStateForm } from './util.jsx'


const createParentComponent = function(schema, store, Form) {
  return class Component extends React.Component {
    constructor(props) {
      super(props)
      this.state = {
        schema,
        value: store.getState().form.myForm
      }
      this.unsubscribe = store.subscribe(() => {
        const {form} = store.getState()
        if (form.myForm !== this.state.value) {
          this.setState({
            ...this.state,
            value: form.myForm
          })
        }
      })
    }
    handleSubmit = () => {
      this.props.onSubmit()
    }
    render() {
      const {schema, value} = this.state
      return (
        <Provider 
          store={store}
        >
          <Form 
            name="myForm"
            schema={schema} 
            value={value} 
            onSubmit={this.handleSubmit} 
          />
        </Provider>
      )
    }
  }
}

describe('user input value', () => {
  let store
  let stateForm
  beforeAll((done) => {
    store = createStore(combineReducers({
      form: formReducer
    }))
    const schema = _.map({
      stringField: _.required.string,
      listField: _.required.list(_.string)
    })

    const StateForm = createMockStateForm(function() {
      if (this.props.state) {
        stateForm = this
        done()
      }
    })
    const GateSchemaForm = createForm({
      transformer,
      StateForm
    })
    const Component = createParentComponent(schema, store, GateSchemaForm)
    renderer.create(<Component />)
  })

  it('store update', (done) => {
    const inputValue = Math.random().toString()
    expect(store.getState().form.myForm).toBeUndefined()
    stateForm.emitUserInput('/stringField', inputValue) 
    setTimeout(() => {
      expect(store.getState().form.myForm).toBeInstanceOf(Object)
      expect(store.getState().form.myForm.stringField).toBe(inputValue)
      done()
    }, 0)
  })
})

