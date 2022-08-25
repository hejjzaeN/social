const app = require('./src/app')
const pool = require('./src/pool')

pool
    .connect({
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        database: process.env.DB_DATABASE_TEST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD
    })
    .then(() => {
        app().listen(process.env.APP_PORT, () => {
            console.log(`Listening on port ${process.env.APP_PORT}`)
        })
    })
    .catch((err) => {
        console.error(err)
    })
