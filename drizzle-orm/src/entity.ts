export const entityKind = Symbol.for('drizzle:entityKind');
export const hasOwnEntityKind = Symbol.for('drizzle:hasOwnEntityKind');

export interface DrizzleEntity {
	[entityKind]: string;
}

export type DrizzleEntityClass<T> =
	& ((abstract new(...args: any[]) => T) | (new(...args: any[]) => T))
	& DrizzleEntity;

export function is<T extends DrizzleEntityClass<any>>(value: any, type: T): value is InstanceType<T> {
	if (!value || typeof value !== 'object') {
		return false;
	}

	if (value instanceof type) { // eslint-disable-line no-instanceof/no-instanceof
		return true;
	}

	if (!Object.prototype.hasOwnProperty.call(type, entityKind)) {
		throw new Error(
			`Class "${
				type.name ?? '<unknown>'
			}" doesn't look like a Drizzle entity. If this is incorrect and the class is provided by Drizzle, please report this as a bug.`,
		);
	}

	let proto = Object.getPrototypeOf(value);
	// Traverse the prototype chain to find the entityKind
	while (proto) {
		if (entityKind in proto.constructor && proto.constructor[entityKind] === type[entityKind]) {
			return true;
		}

		proto = Object.getPrototypeOf(proto);
	}

	return false;
}
