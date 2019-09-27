/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

/* eslint-env es6 */
const hydralfo = require("../src/hydralfo");
const util = require("../src/components/util");

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

const gen_doc = async (doc, dest = path.join('docs', 'collections')) => {
    const functions_dir = path.join(dest, '_functions');
    const categories_dir = path.join(dest, '_categories');

    await util.cb_to_promise((cb) => fs.mkdir(`${dest}`, cb));
    await util.cb_to_promise((cb) => fs.mkdir(categories_dir, cb));
    await util.cb_to_promise((cb) => fs.mkdir(functions_dir, cb));

    Object.entries(doc)
        .sort(([a], [b]) => (a < b ? -1 : (a === b ? 0 : 1)))
        .forEach(([category_name, category]) => {
            const category_doc = category.__doc;

            fs.open(path.join(categories_dir, `${category_name}.md`), "w", async (err, cat_fh) => {
                if (err) {
                    throw new Error(err);
                }
                let cat_title = category_name;
                let cat_description = ``;
                if (typeof category_doc !== 'undefined') {
                    cat_title = category_doc.title;
                    cat_description = category_doc.description;
                }
                await write_all(cat_fh, `---
name: ${category_name}
title: ${cat_title}
---
# ${cat_title}

${cat_description}

{% assign catfuns = site.functions | where: "fun_cat", "${category_name}" %}
{% for function in catfuns %}
[{{ function.name }} - {{ function.title }}]({{ function.url }})
{% endfor %}
`);
                
                await util.cb_to_promise((cb) => fs.close(cat_fh, cb));
            });

            Object.entries(category)
                .filter(([name]) => name.indexOf('__') !== 0)
                .sort((a, b) => (a[0] < b[0] ? -1 : (a[0] === b[0] ? 0 : 1)))
                .forEach(([fun_name, fun_doc]) => {
                    let fun_title = fun_name;
                    let fun_description = 'Not documented yet.';
                    if (typeof fun_doc !== 'undefined') {
                        fun_title = fun_doc.title;
                        fun_description = fun_doc.description;

                        // TODO: add parameters, return description, and examples
                    }

                    const fun_file = path.join(functions_dir, `${fun_name}.md`);
                    console.log(fun_file);
                    fs.open(fun_file, "w", async (err, fun_fh) => {
                        if (err) {
                            throw new Error(err);
                        }
                        await write_all(fun_fh, `---
name: ${fun_name}
title: ${fun_title}
fun_cat: ${category_name}
---
## ${fun_title}

${fun_description}
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
