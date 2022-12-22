import { customAlphabet } from 'nanoid/async'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const MiniID = customAlphabet(alphabet, 10)

export default MiniID
