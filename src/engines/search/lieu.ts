import { parseResultList } from '../../parser'
import { EngineResponse } from '../../search'

export async function request(query): Promise<EngineResponse> {
	let value =  await parseResultList('https://lieu.cblgh.org/?q='+query, {
        // lieu search
		session: true,

		resultItemPath: 'li.entry',
		titlePath: 'a',
		hrefPath: 'a[href]',
		contentPath: '.TRY',
		//suggestionPath: 'a.result-group-layout__queryCorrectedText-2Uw3R[href]',
	})
    console.log('returning' + value.results);
    return value;
}

export const weight = 1.75