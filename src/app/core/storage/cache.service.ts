import { Injectable 							} from '@angular/core';
import { HttpClient 							} from '@angular/common/http';

import { CachedItemInterface 					} from './cached-item.interface';

@Injectable({
	providedIn: 'root'
})

export class CacheService {

	readonly PREFIX 							= 'bms';
	readonly TIMEOUT 							= 2592000; // 30 day in seconds
	private defaultStorage: any;

	// KEYS
	static readonly USER 						= 'user';
	static readonly DISTRIBUTIONS              	= 'distributions';

	constructor() {
		this.defaultStorage = localStorage;
	}

	/**
	* Get the key as stored in the storage
	* @param  {string} key
	* @return {string}
	*/
	getRealKey(key: string) {
		return this.PREFIX + '_' + key;
	}

	/**
	 * Converts seconds to milliseconds
	 * @param  s
	 * @return
	 */
	secToMs(s) {
		return s * 1000;
	}

	/**
	* Get item from cache.
	* item = { storageTime : time, value : value}
	* @param  {string} key
	* @return {any}
	*/
	get(key) {
		key = this.getRealKey(key);
		let item = this.defaultStorage.getItem(key);
		if (item) {
			let object: CachedItemInterface = JSON.parse(item) as CachedItemInterface || {};
			let now = (new Date()).getTime();

			// apply time policy to validate the cached object
			if (object.storageTime + this.secToMs(object.limit) < now) {
				//we assume the cached value expired
				this.remove(key);
				return null;
			}

			return object.value;
		}

		return null;
	}

	/**
	* Get the value and remove it from the cache
	* @param  {string} key
	* @return {any}
	*/
	pop(key: string) {
		let item = this.get(key);
		this.remove(key);
		return item;
	}

	/**
	* Store a value in the cache
	* object = { storageTime : time, value : value}
	* @param  {string}    key
	* @param  {any}       value
	* @param  {any}       options {
	*     canBeDeleted: boolean
	*     timeout: number in seconds
	* }
	* @return {any}
	*/
	set(key: string, value: any, options: any = {}) {
		//default canBeDeleted
		if (options.canBeDeleted == null) {
			options.canBeDeleted = true;
		}

		//default timeout
		options.timeout == options.timeout || this.TIMEOUT;

		let object: CachedItemInterface = {
			storageTime: (new Date()).getTime(), //in milliseconds
			value: value,
			limit: this.TIMEOUT, // in seconds
			canBeDeleted: options.canBeDeleted
		};

		key = this.getRealKey(key);

		this.defaultStorage.setItem(key, JSON.stringify(object));
	}

	isDeletable(key: string) {
		key = this.getRealKey(key);
		let item: CachedItemInterface = this.defaultStorage.getItem(key) || {};
		return item.canBeDeleted;
	}

	/**
	* Remove an object from the cache
	* @param  {string} key
	* @return {[type]}
	*/
	remove(key: string) {
		if (this.isDeletable(key)) {
			key = this.getRealKey(key);
			this.defaultStorage.removeItem(key);
		}
	}

	/**
	* Clear the whole cache
	* Remove all items generated by this cache
	* @return {any}
	*/
	clear() {
		Object.keys(this.defaultStorage)
			.filter(key => { return key.toString().indexOf(this.PREFIX) >= 0; })
			.forEach((item, key, array) => {
				let cached: CachedItemInterface = JSON.parse(this.defaultStorage[item]);
				if (cached.canBeDeleted) {
					delete this.defaultStorage[item];
				}
			});
	}

}
