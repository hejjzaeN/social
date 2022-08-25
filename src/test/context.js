const { randomBytes } = require('crypto')
const { default: migrate } = require('node-pg-migrate')
const format = require('pg-format')
const pool = require('../pool')

const DEFAULT_OPTS = {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT,
    database: process.env.DB_DATABASE_TEST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
}

class Context {
    static async build() {
        const roleName = 'a' + randomBytes(4).toString('hex')

        await pool.connect(DEFAULT_OPTS)
        await pool.query(format(
            'CREATE ROLE %I WITH LOGIN PASSWORD %L;', roleName, roleName
        ))
        await pool.query(format(
            'CREATE SCHEMA %I AUTHORIZATION %I', roleName, roleName
        ))
        await pool.close()
        await migrate({
            schema: roleName,
            direction: 'up',
            log: () => {},
            noLock: true,
            dir: 'migrations',
            databaseUrl: {
                host: process.env.DB_HOST,
                port: +process.env.DB_PORT,
                database: process.env.DB_DATABASE_TEST,
                user: roleName,
                password: roleName
            }
        })

        await pool.connect(DEFAULT_OPTS)

        return new Context(roleName)
    }

    constructor(roleName) {
        this.roleName = roleName
    }

    async reset() {
        return pool.query('DELETE FROM users;')
    }

    async close() {
        await pool.close()
        await pool.connect(DEFAULT_OPTS)
        await pool.query(format(
            `DROP SCHEMA %I CASCADE;`, this.roleName
        ))
        await pool.query(format(
            `DROP ROLE %I;`, this.roleName
        ))
        await pool.close()
    }
}

module.exports = Context
