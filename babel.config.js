"use strict";

module.exports = function (api) {
    const env = api.env();

    const config = {
        presets: [
            ["@babel/preset-env", {
                targets: "> 10%, not dead"
                , modules: "cjs"
            }]
        ]
        , plugins: []
        , sourceMaps: "both"
        , sourceType: "unambiguous"
    };

    if (env.indexOf(":mini") > -1) {
        config.presets.push(["minify"]);
    }
    if (env.indexOf("test") > -1 || env.indexOf("coverage") > -1) {
        config.plugins.push(["istanbul"]);
    }

    return config;
};
