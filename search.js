const requireDir = require('require-dir')
const normalizeUrl = require('./normalize-url')

const engines = requireDir('./engines')

async function requestAllEngines(query) {
	const promises = []
	for (let engineName in engines) {
		let engine = engines[engineName]
		if (engine.request)
			promises.push(engine.request(query))
	}
	const resolvedRequests = await Promise.all(promises)
	results = {}
	for (const engineIndex in resolvedRequests) {
		const engineName = Object.keys(engines)[engineIndex]
		results[engineName] = resolvedRequests[engineIndex]
	}
	return results
}

async function websites(query) {
	const results = {}
	const enginesResults = await requestAllEngines(query)
	var answer = {}
	for (engineName in enginesResults) {
		const engine = engines[engineName]
		const engineResults = enginesResults[engineName]

		const engineAnswer = engineResults.answer
		if (engineAnswer != null && (answer.engine && answer.engine.weight || 1 < engine.weight || 1)) {
			answer = engineAnswer
			answer.engine = engine
		}

		for (const result of engineResults.results || []) {
			const normalUrl = normalizeUrl(result.url)

			// Default values
			if (!results[normalUrl])
				results[normalUrl] = {
					url: normalUrl,
					title: result.title,
					content: result.content,
					score: 0,
					weight: engine.weight || 1,
					engines: []
				}

			// position 1 is score 1, position 2 is score .5, position 3 is score .333, etc

			if (results[normalUrl].weight || 1 < engine.weight || 1) {
				// if the weight of this engine is higher than the previous one, replace the title and content
				results[normalUrl].title = result.title
				results[normalUrl].content = result.content
			}
			results[normalUrl].score += 1 / result.position
			results[normalUrl].engines.push(engineName)
		}
	}

	const calculatedResults = Object.values(results).sort((a, b) => b.score - a.score).filter((result) => result.url != answer.url)

	return {
		results: calculatedResults,
		answer
	}
}

module.exports = { websites }