import { TaskController } from '../../src/controllers/TaskController'

describe('Testing Tasks', () => {
  describe('Testing Tasks.create', () => {
    test('title is missing', () => {
      try {
        const data = {
          // title: 'title',
          deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            value: 10,
            finished: false,
          },
        }
        TaskController.validateCreateEntries(data)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo title é obrigatório')
      }
    })

    test('deadline is missing', () => {
      try {
        const data = {
          title: 'title',
          // deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            value: 10,
            finished: false,
          },
        }
        TaskController.validateCreateEntries(data)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo deadline é obrigatório')
      }
    })

    test('score.responsible_user is missing', () => {
      try {
        const data = {
          title: 'title',
          deadline: '2022-01-01',
          score: {
            // responsible_user: 1,
            value: 10,
            finished: false,
          },
        }
        TaskController.validateCreateEntries(data)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo score.responsible_user é obrigatório')
      }
    })

    test('score.value is missing', () => {
      try {
        const data = {
          title: 'title',
          deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            // value: 10,
            finished: false,
          },
        }
        TaskController.validateCreateEntries(data)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo score.value é obrigatório')
      }
    })

    test('score.finished is missing', () => {
      try {
        const data = {
          title: 'title',
          deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            value: 10,
            // finished: false
          },
        }
        TaskController.validateCreateEntries(data)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo score.finished é obrigatório')
      }
    })
  })

  describe('Testing Tasks.edit', () => {
    test('task_id is missing', () => {
      try {
        const data = {
          title: 'title',
          deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            value: 10,
            finished: false,
          },
        }
        const params = {}
        TaskController.validateEditEntries(data, params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo task_id é obrigatório')
      }
    })

    test('title is missing', () => {
      try {
        const data = {
          // title: 'title',
          deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            value: 10,
            finished: false,
          },
        }
        const params = {
          id: 1,
        }
        TaskController.validateEditEntries(data, params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo title é obrigatório')
      }
    })

    test('deadline is missing', () => {
      try {
        const data = {
          title: 'title',
          // deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            value: 10,
            finished: false,
          },
        }
        const params = {
          id: 1,
        }
        TaskController.validateEditEntries(data, params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo deadline é obrigatório')
      }
    })

    test('score.responsible_user is missing', () => {
      try {
        const data = {
          title: 'title',
          deadline: '2022-01-01',
          score: {
            // responsible_user: 1,
            value: 10,
            finished: false,
          },
        }
        const params = {
          id: 1,
        }
        TaskController.validateEditEntries(data, params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo score.responsible_user é obrigatório')
      }
    })

    test('score.value is missing', () => {
      try {
        const data = {
          title: 'title',
          deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            // value: 10,
            finished: false,
          },
        }
        const params = {
          id: 1,
        }
        TaskController.validateEditEntries(data, params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo score.value é obrigatório')
      }
    })

    test('score.finished is missing', () => {
      try {
        const data = {
          title: 'title',
          deadline: '2022-01-01',
          score: {
            responsible_user: 1,
            value: 10,
            // finished: false
          },
        }
        const params = {
          id: 1,
        }
        TaskController.validateEditEntries(data, params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo score.finished é obrigatório')
      }
    })
  })

  describe('Testing Tasks.delete', () => {
    test('task_id is missing', () => {
      try {
        const params = {}
        TaskController.validateDeleteEntries(params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo task_id é obrigatório')
      }
    })
  })

  describe('Testing Tasks.get', () => {
    test('option is missing', () => {
      try {
        const params = {}
        TaskController.validateGetEntries(params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo option é obrigatório')
      }
    })
  })

  describe('Testing Tasks.getAll', () => {
    test('username is missing', () => {
      try {
        const params = {}
        TaskController.validateGetAllEntries(params)
        expect(1)
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect(error.message).toBe('Campo username é obrigatório')
      }
    })
  })
})
