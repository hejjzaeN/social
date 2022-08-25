const request = require('supertest')
const buildApp = require('../../app')
const UserRepo = require('../../repos/user-repo')
const Context = require('../context')

let context
beforeAll(async () => {
    context = await Context.build()
})

beforeEach(async () => {
    await context.reset()
})

afterAll(() => {
    return context.close()
})

it('create a user', async () => {
    const startCount = await UserRepo.count();

    await request(buildApp())
        .post('/users')
        .send({ username: 'test', bio: 'test bio' })
        .expect(200)

    const finalCount = await UserRepo.count()
    expect(finalCount - startCount).toEqual(1);
})
