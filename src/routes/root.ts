/* eslint-disable @typescript-eslint/no-unused-vars */
import { FastifyPluginAsync } from 'fastify'

const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
	fastify.get('/', async function (request, reply) {
		return { root: true }
	})
}

export default root
