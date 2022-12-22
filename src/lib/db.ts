import chalk from 'chalk'
import { MongoClient } from 'mongodb'
import type { Db } from 'mongodb'

let cliente

// ssh -L 27020:localhost:27017 camo@ec2-18-235-173-243.compute-1.amazonaws.com

const configs = {
	local: {
		dbName: '',
		url: 'mongodb://localhost:27017'
	},
	dev: {
		dbName: '',
		url: 'mongodb://localhost:27017'
	},
	prod: {
		dbName: '',
		url: 'mongodb://localhost:27017'
	}
}

async function DB(nombreDB: string): Promise<Db> {
	try {
		console.log(chalk.hex('#EA8C55')('======= DB ======'), nombreDB)
		console.log('process.env.MODO', process.env.MODO)
		let config = configs.prod

		if (process.env.MODO === 'local') config = configs.local
		else if (process.env.MODO === 'dev') config = configs.dev

		if (!nombreDB) nombreDB = config.dbName

		if (process.env.MODO !== 'prod') nombreDB = `${nombreDB}-test`
		console.log('nombreDB', nombreDB)

		const conectado = cliente && (await cliente.db('admin').command({ ping: 1 }))

		// console.log(chalk.green('conectado'), conectado)

		if (!conectado) {
			console.log(chalk.hex('#EA8C55')('Conectando DB'), nombreDB)
			cliente = new MongoClient(config.url)
		}

		// Connect the client to the server
		await cliente.connect()

		return cliente.db(nombreDB)
	} catch (e) {
		console.error()
		console.log('----------No se pudo conectar con la base de datos----------')
		console.log('process.env.MODO', process.env.MODO)
		console.log(e)
		// TODO Notificar por email a soporte!!
		throw new Error('No se pudo conectar con la base de datos')
	}
}

export default DB
