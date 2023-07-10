import axios from 'axios'
const baseUrl = 'http://localhost:3000'
require('dotenv').config()

describe('API Endpoint Tests', () => {
  let userId
  let token
  let taskId
  let repId
  const name = 'Admin test'
  const nickname = 'adminTest'
  const email = 'admin_reptask@reptask.com'
  const password = '123123123'

  // /admin
  it('should handle /admin endpoint', async () => {
    const adminToken = process.env.ADMIN_TOKEN
    const response = await axios.post(
      `${baseUrl}/admin`,
      {
        rep: {
          name: 'Rep Tsunami',
          code: 'RTSNMI',
        },
        admin: {
          name,
          nickname,
          email,
          password,
        },
      },
      { headers: { Authorization: adminToken } }
    )
    expect(response.status).toEqual(201)
    userId = response.data.admin_id
    // Add more assertions based on the expected response
  })

  // /login
  it('should handle /login endpoint', async () => {
    const response = await axios.post(`${baseUrl}/login`, { email, password })
    expect(response.status).toEqual(200)
    token = response.data.token
    repId = response.data.user.reps_id
    // Add more assertions based on the expected response
  })

  // /change-password/:id
  it('should handle /change-password/:id endpoint', async () => {
    const response = await axios.post(`${baseUrl}/change-password/${userId}`, {
      newPassword: password,
      oldPassword: password,
    })
    expect(response.status).toEqual(200)
    expect(response.data.message).toEqual('Senha alterada com sucesso')
    // Add more assertions based on the expected response
  })

  // /tasks

  const createTask = async () => {
    const response = await axios.post(
      `${baseUrl}/tasks`,
      {
        title: 'My test task',
        description: 'My test task',
        deadline: '2030-07-11T00:00:00.000Z',
        score: {
          responsible_user: userId,
          value: '50',
          finished: '0',
        },
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return { status: response.status, newTaskId: response.data.taskId }
  }
  it('should handle /tasks endpoint', async () => {
    const { status, newTaskId } = await createTask()
    expect(status).toEqual(200)
    taskId = newTaskId
    // Add more assertions based on the expected response
  })

  // /tasks/:id
  it('should handle /tasks/:id endpoint', async () => {
    const { newTaskId } = await createTask()
    const response = await axios.delete(`${baseUrl}/tasks/${newTaskId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /comments
  it('should handle /comments endpoint', async () => {
    const response = await axios.post(
      `${baseUrl}/comments`,
      {
        task_id: taskId,
        user_id: userId,
        comment: 'My comment',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /comments/:task
  it('should handle /comments/:task endpoint', async () => {
    const response = await axios.get(`${baseUrl}/comments/${taskId}`, { headers: { Authorization: `Bearer ${token}` } })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /tasks-all/:rep/:username?
  it('should handle /tasks-all/:rep/:username? endpoint', async () => {
    const username = 'testuser' // Replace with a valid username (optional)
    const url = `${baseUrl}/tasks-all/${repId}` + (username ? `/${username}` : '')
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /tasks/:option/:rep/:username?
  it('should handle /tasks/:option/:rep/:username? endpoint', async () => {
    const option = 'option1' // Replace with a valid option
    const username = 'testuser' // Replace with a valid username (optional)
    const url = `${baseUrl}/tasks/${option}/${repId}` + (username ? `/${username}` : '')
    const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /users-all
  it('should handle /users-all endpoint', async () => {
    const response = await axios.get(`${baseUrl}/users-all`, { headers: { Authorization: `Bearer ${token}` } })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /users-by-rep/:rep
  it('should handle /users-by-rep/:rep endpoint', async () => {
    const response = await axios.get(`${baseUrl}/users-by-rep/${repId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /users/:username
  it('should handle /users/:username endpoint', async () => {
    const response = await axios.get(`${baseUrl}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /users
  let justCreatedUserId
  it('should handle /users endpoint', async () => {
    const response = await axios.post(
      `${baseUrl}/users`,
      {
        name: 'Another one',
        nickname: 'bites the dust',
        email: 'AnotherUser@reptask.com',
        password,
        user_type: '0',
        reps_id: repId,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    expect(response.status).toEqual(201)
    justCreatedUserId = response.data.user_id
    // Add more assertions based on the expected response
  })

  // /users/:id
  it('should handle /users/:id delete endpoint', async () => {
    const response = await axios.delete(`${baseUrl}/users/${justCreatedUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /items-all
  it('should handle /items-all endpoint', async () => {
    const response = await axios.get(`${baseUrl}/items-all`, { headers: { Authorization: `Bearer ${token}` } }) // Add more assertions based on the expected response
    expect(response.status).toEqual(200)
  })

  // /items/:id
  it('should handle /items/:id endpoint', async () => {
    const response = await axios.get(`${baseUrl}/items/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /items

  const createNewItem = async () => {
    const response = await axios.post(
      `${baseUrl}/items`,
      {
        title: 'dose de cachaça 2',
        value: '50',
      },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    return { newItemId: response.data.itemId, status: response.status }
  }

  let justCreatedItemId
  it('should handle /items endpoint', async () => {
    const { status, newItemId } = await createNewItem()
    justCreatedItemId = newItemId
    expect(status).toEqual(200)

    // Add more assertions based on the expected response
  })

  // /items/:id
  it('should handle /items/:id endpoint', async () => {
    const response = await axios.delete(`${baseUrl}/items/${justCreatedItemId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })

  // /items/buy
  it('should handle /items/buy endpoint', async () => {
    const { newItemId } = await createNewItem()
    const response = await axios.post(
      `${baseUrl}/items/buy`,
      { user_id: userId, item_id: newItemId },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    expect(response.status).toEqual(200)
    // Add more assertions based on the expected response
  })
})
