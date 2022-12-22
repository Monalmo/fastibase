/* eslint-disable @typescript-eslint/no-empty-function */
const consoloff = {
	log: () => {},
	info: () => {},
	warn: () => {},
	error: () => {}
}

// El consolo es como la consola, pero solo funciona (log, info, error, etc) en desarrollo
const consolo = process.env.MODO === 'dev' ? console : consoloff

export default consolo
