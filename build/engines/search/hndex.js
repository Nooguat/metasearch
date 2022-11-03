"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.weight = exports.request = void 0;
const parser_1 = require("../../parser");
async function request(query) {
    let value = await (0, parser_1.parseResultList)('https://hndex.org/?q=' + query, {
        // hndex search
        session: true,
        resultItemPath: 'section',
        titlePath: 'p > cite',
        hrefPath: 'a[href]',
        contentPath: '.TRY',
        //suggestionPath: 'a.result-group-layout__queryCorrectedText-2Uw3R[href]',
    });
    console.log('returning' + value.results);
    return value;
}
exports.request = request;
exports.weight = 2;
