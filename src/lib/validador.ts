import _ from 'lodash'
import isEmail from 'validator/lib/isEmail'
import isURL from 'validator/lib/isURL'
import isMobilePhone from 'validator/lib/isMobilePhone'
import { phone } from 'phone'
import * as rutJS from 'rut.js'

function objError(key, mensaje) {
	const err = {}
	err[key] = mensaje
	return err
}

const validador = {
	id(id, key) {
		if (_.isEmpty(key)) throw [500, objError('key', 'falta')]
		if (typeof id === 'undefined') throw [400, objError(key, 'falta')]
		if ([null, undefined, 'null', 'undefined'].includes(id)) throw [400, objError(key, 'falta')]
		if (_.isEmpty(id)) throw [400, objError(key, 'falta')]
		// if (typeof id !== 'string') throw [400, objError(key, 'debe ser string')]
		if (!/^[a-zA-Z0-9-_]+$/.test(id)) throw [400, objError(key, 'sólo letras, numeros y guiones')]
		if (`${id}`.length < 4) throw [400, objError(key, 'mínimo 4 caracteres')]
		if (`${id}`.length > 12) throw [400, objError(key, 'máximo 12 caracteres')]
	},
	idNumerico(id, key) {
		if (_.isEmpty(key)) throw [500, objError('key', 'falta')]
		if (typeof id === 'undefined') throw [400, objError(key, 'falta')]
		if ([null, undefined, 'null', 'undefined'].includes(id)) throw [400, objError(key, 'falta')]
		if (!/^[0-9]+$/.test(id)) throw [400, objError(key, 'sólo numeros')]
	},
	string(str, key) {
		if (_.isEmpty(key)) throw [500, objError('key', 'falta')]
		if (_.isEmpty(str)) throw [400, objError(key, 'falta')]
		if (typeof str !== 'string') throw [400, objError(key, 'debe ser string')]
	},
	email(email, key = 'email') {
		if (_.isEmpty(email)) throw [400, objError(key, 'falta')]
		if (typeof email !== 'string') throw [400, objError(key, 'debe ser string')]
		const esValido = isEmail(email, {
			allow_display_name: false,
			allow_utf8_local_part: false,
			blacklisted_chars: '></;()'
		})
		if (!esValido) throw [400, objError(key, 'no es email')]
		return email.toLowerCase()
	},
	telefono(x, key = 'telefono') {
		if (_.isEmpty(x)) throw [400, objError(key, 'falta')]
		if (typeof x !== 'string') throw [400, objError(key, 'debe ser string')]
		if (!isMobilePhone(x, 'es-CL', { strictMode: true }))
			throw [400, objError(key, 'debe ser telefono en formato internacional')]
		const validacionConPhone = phone(x)
		if (!validacionConPhone.isValid) throw [400, objError(key, 'telefono inválido')]
		return validacionConPhone.phoneNumber
	},
	pass(pass, key = 'pass') {
		if (_.isEmpty(pass)) throw [400, objError(key, 'falta')]
		if (typeof pass !== 'string') throw [400, objError(key, 'debe ser string')]
		// if (pass.length < 7) throw [400, objError(key, 'muy corto')]
	},
	rut(rut, key = 'rut') {
		if (_.isEmpty(rut)) throw [400, objError(key, 'falta')]
		if (typeof rut !== 'string') throw [400, objError(key, 'debe ser string')]
		// console.log('rut', rut)
		if (!rutJS.validate(rut)) throw [400, objError(key, 'no es un rut válido')]
		// if (rut.length < 7) throw [400, objError(key, 'muy corto')]
		return rutJS.format(rut)
	},
	url(str, key = 'url') {
		if (_.isEmpty(str)) throw [400, objError(key, 'falta')]
		if (typeof str !== 'string') throw [400, objError(key, 'debe ser string')]
		const reglas = {
			protocols: ['http', 'https'],
			require_protocol: true,
			require_valid_protocol: true
		}
		if (!isURL(str, reglas)) throw [400, objError(key, 'no es url válida')]
	},
	latLng(x, key = 'latLng') {
		if (_.isEmpty(x)) throw [400, objError(key, 'falta')]
		if (!_.isArray(x)) throw [400, objError(key, 'debe ser array')]
		if (x.length !== 2) throw [400, objError(key, 'debe ser array de coordenadas GPS')]
		if (!_.isNumber(x[0]) || !_.isNumber(x[1]) || typeof x[0] !== 'number' || typeof x[1] !== 'number')
			throw [400, objError(key, 'debe ser array de coordenadas GPS (lat y long son numeros)')]
	}
}

const validado = {}

_.forEach(validador, (fx, tipo) => {
	validado[tipo] = function (elemento) {
		try {
			validador[tipo](elemento)
			return elemento
		} catch (e) {
			return undefined
		}
	}
})

// function validado2 (tipo, elemento) {
// 	if (!validador[tipo]) throw `Validación de tipo "${tipo}" no existe`
// 	try {
// 		validador[tipo](elemento)
// 	} catch (e) {
// 		return undefined
// 	}
// }

export default validador

export { validador, validado }
