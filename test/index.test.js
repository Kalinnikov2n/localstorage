var createStore = require('storeon')

var persistState = require('../')

afterEach(function () {
  localStorage.clear()
  jest.restoreAllMocks()
})

it('should update the localStorage', function () {
  var store = createStore([
    persistState()
  ])
  store.on('test', function () {
    return { b: 1 }
  })
  store.dispatch('test')

  expect(localStorage.getItem('storeon')).toEqual(JSON.stringify({ b: 1 }))
})

it('should update the state after init', function () {
  var data = JSON.stringify({ a: 1, b: 2 })
  localStorage.setItem('storeon', data)

  createStore([
    persistState()
  ])

  expect(localStorage.getItem('storeon')).toEqual(data)
})

it('should update the localStorage only white listed names', function () {
  var store = createStore([
    persistState(['a'])
  ])

  store.on('test', function () {
    return { a: 1, b: 1 }
  })
  store.dispatch('test')

  expect(localStorage.getItem('storeon')).toEqual(JSON.stringify({ a: 1 }))
})

it('should works with missed config key', function () {
  var store = createStore([
    persistState(['a'], { })
  ])

  store.on('test', function () {
    return { a: 1 }
  })
  store.dispatch('test')

  expect(localStorage.getItem('storeon')).toEqual(JSON.stringify({ a: 1 }))
})

it('should hande non jsonable object in localStorage', function () {
  localStorage.setItem('storeon', 'test string')

  var store = createStore([
    persistState()
  ])

  expect(store.get()).toEqual({})
})

it('should handle non jsonable object in state', function () {
  jest.spyOn(JSON, 'stringify').mockImplementationOnce(function () {
    throw Error('mock error')
  })
  var store = createStore([
    persistState(['a'])
  ])

  store.on('test', function () {
    return 'nonce'
  })

  expect(store.get()).toEqual({})
})

it('should not process @dispatch before @init', function () {
  localStorage.setItem('storeon', JSON.stringify({ a: 'foo' }))

  var store = createStore([
    // This module tries to trigger a save in the local storage module
    function (s) {
      s.on('@init', function () {
        s.dispatch('foo')
      })
    },

    persistState(['a'])
  ])

  // If a save was triggered by the first module, the state would now be blank
  expect(store.get()).toEqual({ a: 'foo' })
})
