/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

/* eslint-env es6 */
const hydralfo = require("../src/hydralfo");
const util = require("../src/components/util");
const chalk = require('chalk');

// eslint-disable-next-line no-void
const ud = void 0;

import * as fs from 'fs';
import * as path from 'path';

const write_all = (fh, data) => new Promise((res, rej) => {
    const wcb = (err, nwri, wdata) => {
        if (err) {
            rej(err);
            return;
        }
        if (nwri === wdata.length) {
            res();
        }
        fs.write(fh, wdata.slice(nwri), wcb);
    };

    fs.write(fh, data, wcb);
});

const check_doc_complete = (doc_name, doc, required) => {

    const log_missing = (sev, n) => {
        const tc = sev ? (sev === 'w' ? chalk.yellow : chalk.red) : chalk.red;
        const mn = n ? `.${n}` : "";
        console.log(tc(`missing doc: ${doc_name}${mn}`));
    };

    if (typeof doc === 'undefined') {
        if (typeof required === 'undefined') {
            return true;
        } else if (typeof required === 'boolean') {
            if (required) {
                log_missing();
            } else {
                log_missing('w');
            }
            return false;
        }
        log_missing('w');
        return false;
    } else if (typeof doc !== 'object') {
        return true;
    } else if (Array.isArray(doc)) {
        return true;
    }
    if (typeof required !== 'object') {
        return true;
    }

    const rets = Object.entries(required).map(([name, check]) => {
        let v = doc[name];
        if (typeof check === 'boolean') {
            if (typeof v === 'string' && v.trim() === '') {
                v = ud;
            }
            
            if (typeof v === 'undefined') {
                if (check) {
                    log_missing('e', name);
                } else {
                    log_missing('w', name);
                }
                return false;
            }
            return true;
        }
        return check_doc_complete(`${doc_name}.${name}`, v, check);
    });
    return rets.reduce((prev, curr) => prev && curr, true);
};

const gen_doc = async (doc, options = {}) => {
    const {baseurl = "/hydra-lfo", dest = path.join('docs')} = options;
    const functions_dir = path.join(dest, '_functions');
    const categories_dir = path.join(dest, '_categories');

    await util.cb_to_promise((cb) => fs.mkdir(`${dest}`, cb));
    await util.cb_to_promise((cb) => fs.mkdir(categories_dir, cb));
    await util.cb_to_promise((cb) => fs.mkdir(functions_dir, cb));

    const doc_functions = {
        doc_link: (page, title) => `[${title ? title : page}](${page[0] === '/' ? baseurl : ""}${page}.html)`
    };

    Object.entries(doc)
        .sort(([a], [b]) => (a < b ? -1 : (a === b ? 0 : 1)))
        .forEach(([category_name, category]) => {
            let category_doc = category.__doc;

            let cat_title = category_name;
            let cat_description = ``;
            if (typeof category_doc !== 'undefined') {
                if (typeof category_doc === 'function') {
                    category_doc = category_doc(doc_functions);
                }
                cat_title = category_doc.title;
                cat_description = category_doc.description;
            }

            const cat_file = path.join(categories_dir, `${category_name}.md`);

            ((c) => {
                console.log((c ? chalk.green : chalk.red)(`Writing category ${category_name} => ${cat_file}`));
            })(check_doc_complete(
                `category ${category_name}`
                , category_doc
                , {description: true, title: true}
            ));

            fs.open(cat_file, "w", async (err, cat_fh) => {
                if (err) {
                    throw new Error(err);
                }

                const doc_info = {
                    category_name
                    , title: cat_title
                    , description: cat_description === '' ? cat_title : cat_description
                    , doc: category_doc
                };

                await write_all(cat_fh, `---
${JSON.stringify(doc_info, null, 2)}
---
`);
                
                await util.cb_to_promise((cb) => fs.close(cat_fh, cb));
            });

            Object.entries(category)
                .filter(([name]) => name.indexOf('__') !== 0)
                .sort((a, b) => (a[0] < b[0] ? -1 : (a[0] === b[0] ? 0 : 1)))
                .forEach(([fun_name, fun_doc]) => {
                    let fun_title = fun_name;
                    let fun_description = 'Not documented yet.';
                    let afun_doc = fun_doc;
                    if (typeof afun_doc !== 'undefined') {
                        if (typeof afun_doc === 'function') {
                            afun_doc = fun_doc(doc_functions);
                        }
                        fun_title = afun_doc.title;
                        fun_description = afun_doc.description;
                    }

                    const fun_file = path.join(functions_dir, `${fun_name}.md`);

                    ((c) => {
                        // eslint-disable-next-line max-len
                        console.log((c ? chalk.green : chalk.red)(`generating function doc: ${fun_name} => ${fun_file}`));
                    })(check_doc_complete(
                        `function ${fun_name}`
                        , afun_doc
                        , {
                            title: true
                            , command: true
                            , description: true
                            , return: true
                            , params: true
                            , examples: true
                        }
                    ));

                    fs.open(fun_file, "w", async (err, fun_fh) => {
                        if (err) {
                            throw new Error(err);
                        }

                        const doc_info = {
                            function_name: fun_name
                            , title: fun_title
                            , function_category: category_name
                            , description: fun_description
                            , doc: afun_doc
                        };

                        await write_all(fun_fh, `---
${JSON.stringify(doc_info, null, 2)}
---
`);
                        await util.cb_to_promise((cb) => fs.close(fun_fh, cb));
                    });

                });
        });
};

const main = () => {
    const doc = hydralfo.get_doc();
    gen_doc(doc);
};


main();
