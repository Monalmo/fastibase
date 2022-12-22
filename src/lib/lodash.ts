import * as _ from 'lodash'

declare module 'lodash' {
	interface LoDashStatic {
		omitDeep<T>(object: Dictionary<T> | null | undefined, predicate?: ValueKeyIteratee<T>): Dictionary<T>

		omitDeep<T>(object: NumericDictionary<T> | null | undefined, predicate?: ValueKeyIteratee<T>): NumericDictionary<T>

		omitDeep<T extends object>(object: T | null | undefined, predicate: ValueKeyIteratee<T[keyof T]>): PartialObject<T>
	}
}

_.mixin({
	omitDeep
})

function omitDeep(object, predicate) {
	function omitFn(v) {
		if (v && typeof v === 'object') {
			if (_.isArray(predicate))
				predicate.forEach(k => {
					delete v[k]
				})
			else if (_.isFunction(predicate))
				_.forEach(v, (val, key) => {
					if (predicate(val, key)) delete v[key]
				})
		}
	}
	return _.cloneDeepWith(object, omitFn)
}

export default _
