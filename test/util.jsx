import React from 'react'

export function createMockStateForm(onRender) {
  return class StateForm extends React.Component {
    emitUserInput(path, value, index) {
      this.props.onInput(path, value, index)
    }
    emitSubmit() {
      this.props.onSubmit()
    }
    render() {
      onRender.call(this)
      return <div />
    }
  }
}