import { parseResultList } from '../../parser'
import { EngineResponse } from '../../search'

export async function request(query): Promise<EngineResponse> {
	let value =  await parseResultList('http://127.0.0.1:3000/_search?q='+query, {
        // nb search
		session: true,

		resultItemPath: 'h4',
		titlePath: 'a[href]',
		hrefPath: 'a[href]',
		contentPath: '.TRYTOFIND',
		root: 'http://127.0.0.1:3000/'
		//suggestionPath: 'a.result-group-layout__queryCorrectedText-2Uw3R[href]',
	})
    //console.log('returning' + value);
    return value;
}

export const weight = 2

