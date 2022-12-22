'use strict'
import chalk from 'chalk'
import _ from 'lodash'
import type { KeyLike } from 'jose'

import consolo from '@/lib/consolo'
import cripto from '@/lib/cripto'

export type ParDeLlaves = {
	publica: KeyLike
	privada?: KeyLike
}

export type ParDeLlavesExportadas = {
	publica: string
	privada?: string
}

export interface LlaveroExportado {
	nombre: string
	firma: ParDeLlavesExportadas
	encriptacion: ParDeLlavesExportadas
}

class Llavero {
	nombre: string
	_llavesFirma?: ParDeLlaves
	_llavesEncriptacion?: ParDeLlaves
	constructor(nombre) {
		this.nombre = nombre
		this._llavesFirma = undefined
		this._llavesEncriptacion = undefined
	}

	reinstanciar({ nombre, _llavesFirma, _llavesEncriptacion }) {
		this.nombre = nombre
		this._llavesFirma = _llavesFirma
		this._llavesEncriptacion = _llavesEncriptacion
	}

	async init(crearFirmas = false) {
		const nombre = this.nombre
		const fx = `${nombre}(Llavero).init`
		try {
			consolo.log(fx, { nombre, crearFirmas })
			if (crearFirmas) {
				this._llavesFirma = await cripto.crearKeysFirmas()
				this._llavesEncriptacion = await cripto.crearKeysEncriptacion()
			}
			return true
		} catch (e) {
			consolo.error(fx, e)
			throw e
		}
	}

	// Importación

	async importar({ firma, encriptacion }) {
		const fx = `Llavero:${this.nombre}.importar`
		// consolo.log(fx, { firma, encriptacion })

		try {
			if (firma && !_.isEmpty(firma)) {
				const firmaAImportar: ParDeLlaves = {
					publica: await cripto.importar.firma.publica(firma.publica)
				}
				if (firma.privada) firmaAImportar.privada = await cripto.importar.firma.privada(firma.privada)
				this._llavesFirma = firmaAImportar
			}
			if (encriptacion && !_.isEmpty(encriptacion)) {
				const llavesEncriptacionAImportar: ParDeLlaves = {
					publica: await cripto.importar.encriptacion.publica(encriptacion.publica)
				}
				if (encriptacion.privada)
					llavesEncriptacionAImportar.privada = await cripto.importar.encriptacion.privada(encriptacion.privada)
				this._llavesEncriptacion = llavesEncriptacionAImportar
			}
			// Revisar resultado
			// consolo.log(chalk.bgGreen.black(fx))
			return true
		} catch (e) {
			consolo.error(chalk.bgRed.black(fx), e)
			consolo.error('firma.publica', firma.publica)
			consolo.error('firma.privada', firma.privada)
			consolo.error('encriptacion.publica', encriptacion.publica)
			consolo.error('encriptacion.privada', encriptacion.privada)
			throw 'No se pudo importar'
		}
	}

	// Exportación

	async exportar() {
		const fx = `Llavero:${this.nombre}.exportar`
		consolo.log(fx)
		try {
			const firma: ParDeLlavesExportadas = {
				publica: await cripto.exportar.firma.publica(this._llavesFirma?.publica)
			}
			if (this._llavesFirma?.privada) firma.privada = await cripto.exportar.firma.privada(this._llavesFirma?.privada)

			const encriptacion: ParDeLlavesExportadas = {
				publica: await cripto.exportar.encriptacion.publica(this._llavesEncriptacion?.publica)
			}
			if (this._llavesEncriptacion?.privada)
				encriptacion.privada = await cripto.exportar.encriptacion.privada(this._llavesEncriptacion.privada)

			const exportado: LlaveroExportado = { nombre: this.nombre, firma, encriptacion }
			consolo.log(fx, { exportado })
			return exportado
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo exportar'
		}
	}

	async exportarLlavesPublicas() {
		const fx = `Llavero:${this.nombre}.exportarLlavesPublicas`
		try {
			const llaves = {
				firma: {
					publica: await cripto.exportar.firma.publica(this._llavesFirma?.publica)
				},
				encriptacion: {
					publica: await cripto.exportar.encriptacion.publica(this._llavesEncriptacion?.publica)
				}
			}
			return llaves
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo exportarLlavesPublicas'
		}
	}

	// Operaciones

	async encriptar(mensaje) {
		const fx = `Llavero:${this.nombre}.encriptar`
		try {
			// consolo.log(fx, mensaje)
			const llave = this._llavesEncriptacion?.publica
			if (!llave) throw 'Falta llave'
			return await cripto.encriptar(llave, mensaje)
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo encriptar'
		}
	}

	async desencriptar(encriptado) {
		const fx = `Llavero:${this.nombre}.desencriptar`
		try {
			consolo.log(fx)
			const llave = this._llavesEncriptacion?.privada
			return llave && (await cripto.desencriptar(llave, encriptado))
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo desencriptar'
		}
	}

	async firmarToken(cuerpo) {
		const fx = `Llavero:${this.nombre}.firmarToken`
		try {
			consolo.log(fx, cuerpo)
			const llave = this._llavesFirma?.privada
			if (!llave) throw 'Falta llave'

			cuerpo.iss = this.nombre
			const token = await cripto.firmarToken(llave, cuerpo, this.nombre)
			return token
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo firmarToken'
		}
	}

	async verificarFirmaToken(token) {
		const fx = `Llavero:${this.nombre}.verificarFirmaToken`
		try {
			consolo.log(fx)
			const llave = this._llavesFirma?.publica
			return (
				llave &&
				(await cripto.verificarFirmaToken(llave, token, {
					issuer: this.nombre
				}))
			)
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo verificarFirmaToken'
		}
	}

	async crearToken(body) {
		const fx = `Llavero:${this.nombre}.crearToken`
		try {
			consolo.log(fx, body)
			const llave = this._llavesFirma?.privada
			if (!llave) throw 'Falta llave'
			body.iss = this.nombre
			return await cripto.firmarToken(llave, body, this.nombre)
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo crearToken'
		}
	}

	async verificarToken(token, opciones) {
		const fx = `Llavero:${this.nombre}.verificarToken`
		try {
			const llave = this._llavesFirma?.publica
			const ok = llave && (await cripto.verificarFirmaToken(llave, token, opciones))
			consolo.log(chalk.green(fx))
			return ok
		} catch (e) {
			consolo.error(fx, e)
			throw 'No se pudo verificarToken'
		}
	}
}

export default Llavero
