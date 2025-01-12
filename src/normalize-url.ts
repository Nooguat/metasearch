// https://github.com/sindresorhus/normalize-url

import * as querystring from 'querystring'

const DATA_URL_DEFAULT_MIME_TYPE = 'text/plain'
const DATA_URL_DEFAULT_CHARSET = 'us-ascii'

function testParameter(name: string, filters: (RegExp | string)[]) {
	return filters.some(filter => filter instanceof RegExp ? filter.test(name) : filter === name)
}

function normalizeDataURL(urlString: string, { stripHash }) {
	const match = /^data:(?<type>.*?),(?<data>.*?)(?:#(?<hash>.*))?$/.exec(urlString)

	if (!match)
		throw new Error(`Invalid URL: ${urlString}`)

	let { type, data, hash } = match.groups!
	const mediaType = type.split(';')
	hash = stripHash ? '' : hash

	let isBase64 = false
	if (mediaType[mediaType.length - 1] === 'base64') {
		mediaType.pop()
		isBase64 = true
	}

	// Lowercase MIME type
	const mimeType = (mediaType.shift() || '').toLowerCase()
	const attributes = mediaType
		.map(attribute => {
			let [key, value = ''] = attribute.split('=').map(string => string.trim())

			// Lowercase `charset`
			if (key === 'charset') {
				value = value.toLowerCase()

				if (value === DATA_URL_DEFAULT_CHARSET) {
					return ''
				}
			}

			return `${key}${value ? `=${value}` : ''}`
		})
		.filter(Boolean)

	const normalizedMediaType = [
		...attributes
	]

	if (isBase64) {
		normalizedMediaType.push('base64')
	}

	if (normalizedMediaType.length !== 0 || (mimeType && mimeType !== DATA_URL_DEFAULT_MIME_TYPE)) {
		normalizedMediaType.unshift(mimeType)
	}

	return `data:${normalizedMediaType.join(';')},${isBase64 ? data.trim() : data}${hash ? `#${hash}` : ''}`
}

const normalizeUrl = (urlString, options={} as any) => {
	options = {
		defaultProtocol: 'http:',
		normalizeProtocol: true,
		forceHttp: false,
		forceHttps: true,
		stripAuthentication: true,
		stripHash: false,
		stripWWW: false,
		removeQueryParameters: [/^utm_\w+/i],
		removeTrailingSlash: true,
		removeSingleSlash: true,
		removeDirectoryIndex: false,
		sortQueryParameters: true,
		...options
	}

	urlString = urlString.trim()

	if (urlString.startsWith('/rebates/welcome?url=')) { urlString = querystring.parse(urlString.slice(17)).url }

	// Data URL
	if (/^data:/i.test(urlString)) {
		return normalizeDataURL(urlString, options)
	}

	if (/^view-source:/i.test(urlString)) {
		throw new Error('`view-source:` is not supported as it is a non-standard protocol')
	}

	const hasRelativeProtocol = urlString.startsWith('//')
	const isRelativeUrl = !hasRelativeProtocol && /^\.*\//.test(urlString)

	// Prepend protocol
	if (!isRelativeUrl) {
		urlString = urlString.replace(/^(?!(?:\w+:)?\/\/)|^\/\//, options.defaultProtocol)
	}

	const urlObj = new URL(urlString)

	if (options.forceHttp && options.forceHttps) {
		throw new Error('The `forceHttp` and `forceHttps` options cannot be used together')
	}

	if (options.forceHttp && urlObj.protocol === 'https:') {
		urlObj.protocol = 'http:'
	}

	if (options.forceHttps && urlObj.protocol === 'http:') {
		if(!urlObj.host.includes('127.0.0.1')){
			urlObj.protocol = 'https:'
		}
	}

	// Remove auth
	if (options.stripAuthentication) {
		urlObj.username = ''
		urlObj.password = ''
	}

	// Remove hash
	if (options.stripHash) {
		urlObj.hash = ''
	}

	// Remove duplicate slashes if not preceded by a protocol
	if (urlObj.pathname) {
		urlObj.pathname = urlObj.pathname.replace(/(?<!\b(?:[a-z][a-z\d+\-.]{1,50}:))\/{2,}/g, '/')
	}

	// Decode URI octets
	if (urlObj.pathname) {
		try {
			urlObj.pathname = decodeURI(urlObj.pathname)
		} catch (_) {}
	}

	// Remove directory index
	if (options.removeDirectoryIndex === true) {
		options.removeDirectoryIndex = [/^index\.[a-z]+$/]
	}

	if (Array.isArray(options.removeDirectoryIndex) && options.removeDirectoryIndex.length > 0) {
		let pathComponents = urlObj.pathname.split('/')
		const lastComponent = pathComponents[pathComponents.length - 1]

		if (testParameter(lastComponent, options.removeDirectoryIndex)) {
			pathComponents = pathComponents.slice(0, pathComponents.length - 1)
			urlObj.pathname = pathComponents.slice(1).join('/') + '/'
		}
	}

	if (urlObj.hostname) {
		// Remove trailing dot
		urlObj.hostname = urlObj.hostname.replace(/\.$/, '')

		// Remove `www.`
		if (options.stripWWW && /^www\.(?!www\.)(?:[a-z\-\d]{1,63})\.(?:[a-z.\-\d]{2,63})$/.test(urlObj.hostname)) {
			// Each label should be max 63 at length (min: 1).
			// Source: https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_host_names
			// Each TLD should be up to 63 characters long (min: 2).
			// It is technically possible to have a single character TLD, but none currently exist.
			urlObj.hostname = urlObj.hostname.replace(/^www\./, '')
		}
	}

	// Remove query unwanted parameters
	if (Array.isArray(options.removeQueryParameters)) {
		for (const key of [...urlObj.searchParams.keys()]) {
			if (testParameter(key, options.removeQueryParameters)) {
				urlObj.searchParams.delete(key)
			}
		}
	}

	// Sort query parameters
	if (options.sortQueryParameters) {
		urlObj.searchParams.sort()
	}

	if (options.removeTrailingSlash) {
		urlObj.pathname = urlObj.pathname.replace(/\/$/, '')
	}

	const oldUrlString = urlString

	// Take advantage of many of the Node `url` normalizations
	urlString = urlObj.toString()

	if (!options.removeSingleSlash && urlObj.pathname === '/' && !oldUrlString.endsWith('/') && urlObj.hash === '') {
		urlString = urlString.replace(/\/$/, '')
	}

	// Remove ending `/` unless removeSingleSlash is false
	if ((options.removeTrailingSlash || urlObj.pathname === '/') && urlObj.hash === '' && options.removeSingleSlash) {
		urlString = urlString.replace(/\/$/, '')
	}

	// Restore relative protocol, if applicable
	if (hasRelativeProtocol && !options.normalizeProtocol) {
		urlString = urlString.replace(/^http:\/\//, '//')
	}

	// Remove http/https
	if (options.stripProtocol) {
		urlString = urlString.replace(/^(?:https?:)?\/\//, '')
	}

	return urlString
}

export default normalizeUrl
