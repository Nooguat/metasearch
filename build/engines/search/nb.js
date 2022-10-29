"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
const parser_1 = require("../../parser");
async function request(query) {
    let value = await (0, parser_1.parseResultList)('http://127.0.0.1:3000/_search?q=' + query, {
        // nb search
        session: true,
        resultItemPath: 'h4',
        titlePath: 'a[href]',
        hrefPath: 'a[href]',
        contentPath: '.TRYTOFIND',
        root: 'http://127.0.0.1:3000/'
        //suggestionPath: 'a.result-group-layout__queryCorrectedText-2Uw3R[href]',
    });
    //console.log('returning' + value);
    return value;
}
exports.request = request;
exports.weight = 2;
