export default function reducer(state = {}, action = {}) {
  const {type, payload} = action
  if (type === 'GATESCHEMA_FORM_INPUT_OF_PATH') {
   const {name, path, value, parentValue, key} = payload 
   if (path === '/') {
     return Object.assign({}, state, {
       [name]: value
     })
   } else {
     parentValue[key] = value
     return Object.assign({}, state)
   }
  }
  return state
}