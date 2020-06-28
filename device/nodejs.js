/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * 
 * Signderiva (c) 2015-2020
 * Author: Michael VERGOZ <m.vergoz@vergoz.ch>
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

const { device } = require("@signderiva/lib-kernel")
const crypto = require("crypto")
const ec = require('elliptic').ec;
const emoji = require("node-emoji");

class signderivaNodeJSDevice extends device {
  constructor(userBoot, memory) {
    super(memory);
    this.userBoot = userBoot
  }

	uname() {
		return("NodeJS/"+process.version);
  }
  
  onBoot() {
    if (this.userBoot) this.userBoot()
  }

  network() {
    return (null)
  }

  stack(reference) {
    this._reference += reference;
  }


	info(text) {
		console.log(new Date().toLocaleString(), emoji.get('trident'), text)
	}

	error(text) {
		console.log(new Date().toLocaleString(), emoji.get('boom'), text)
	}

	success(text) {
		console.log(new Date().toLocaleString(), emoji.get('satisfied'), text)
	}

	warning(text) {
		console.log(new Date().toLocaleString(), emoji.get('warning'), text)
	}

	debug(text) {
		console.log(new Date().toLocaleString(), emoji.get('yum'), text)
  }

	/**
	 * Get random bytes
	 * @param  {Number} n Number of bytes
	 * @return {Array}   Array of random bytes
	 */
  rand(n) {
    return (crypto.randomBytes(n))
  }

	/**
	 * Retrieve a SHA256 derivated class context
	 * @return {signderivaDeviceSHA256} SHA256 class
	 */
  sha256() {
    return (crypto.createHash("sha256"))
  }

	/**
	 * Retrieve a HMAC derivated class context
	 * @return {signderivaDeviceHMAC} HMAC class
	 */
  hmac() {
    return(null)
  }

	/**
	 * Retrieve a ECDSA derivated class context
	 * @return {signderivaDeviceECDSA} ECDSA class
	 */
  ec(curve) {
    return (new ec(curve))
  }

  /**
	 * Retrieve a AES 256 bits CBC derivated class context
	 * @return {signderivaDeviceAES128CBC} aes128CBC class
	 */
  cipherAES256CBC(key, iv) {
    return(crypto.createCipheriv("aes-256-cbc", key, iv));
  }

    /**
	 * Retrieve a AES 256 bits CBC derivated class context
	 * @return {signderivaDeviceAES128CBC} aes128CBC class
	 */
  decipherAES256CBC(key, iv) {
    return(crypto.createDecipheriv("aes-256-cbc", key, iv));
  }
}

module.exports = signderivaNodeJSDevice