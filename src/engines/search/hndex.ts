import { parseResultList } from '../../parser'
import { EngineResponse } from '../../search'

export async function request(query): Promise<EngineResponse> {
	let value =  await parseResultList('https://hndex.org/?q='+query, {
        // hndex search
		session: true,

		resultItemPath: 'section',
		titlePath: 'p < cite',
		hrefPath: 'a[href]',
		contentPath: '.TRY',
		//suggestionPath: 'a.result-group-layout__queryCorrectedText-2Uw3R[href]',
	})
    //console.log('returning' + value);
    return value;
}

export const weight = 2