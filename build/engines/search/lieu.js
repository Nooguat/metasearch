"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
const parser_1 = require("../../parser");
async function request(query) {
    let value = await (0, parser_1.parseResultList)('https://lieu.cblgh.org/?q=' + query, {
        // lieu search
        session: true,
        resultItemPath: 'li.entry',
        titlePath: 'a',
        hrefPath: 'a[href]',
        contentPath: '.TRY',
        //suggestionPath: 'a.result-group-layout__queryCorrectedText-2Uw3R[href]',
    });
    console.log('returning' + value.results);
    return value;
}
exports.request = request;
exports.weight = 1.75;
