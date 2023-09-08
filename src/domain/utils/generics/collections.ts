export type KeyDictionary<T> = { [key: string]: T }

export type KeyStringDictionary = KeyDictionary<string>

export type KeyStringArrayDictionary = KeyDictionary<Array<string>>

export type PropertyNameDictionary<T> = { [Key in keyof T]: Key }

// export type TypeDictionary<T> = { [Key in keyof T]: T[Key] }