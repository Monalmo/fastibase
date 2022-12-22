import { FastifyRequest } from 'fastify'
import { ObjectID } from 'bson'

// import fastify from 'fastify'

export interface reqDecorado extends FastifyRequest {
	email?: string
	usuarioID?: string
	esResponsable?: boolean
	esAdmin?: boolean
	esGuia?: boolean
	esCarabAdmin?: boolean
	esEscolta?: boolean
}

declare module 'fastify' {
	export interface FastifyRequest {
		email?: string
		loginID?: ObjectID
		perfilID?: ObjectID
		nombre?: string
		isAdminEperk?: boolean
		orgID?: ObjectID
		perfilActivo?: boolean
		isAdmin?: boolean
		isOwner?: boolean
		sinPass?: boolean
	}
}
