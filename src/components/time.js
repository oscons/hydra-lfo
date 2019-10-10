/* Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
 * Licensed under the GNU General Public License, Version 2.0.
 * See LICENSE file for more information */

import {ud, undefault, expand_args, freeze_values, mix_values, get_time, get_bpm} from "./util";

const make_functions = ({logger = console.log}) => {
    const _functions = {};

    _functions.speed = {fun: (args) => {
        const {v: value, m: mix} = expand_args({v: ud, m: ud}, args);

        return (input, gen_args, run_args) => {
            const [vv, mv] = freeze_values([value, mix], run_args, gen_args);
            
            let time_scale = 1;
            if (typeof vv === 'undefined') {
                if (typeof input !== 'undefined') {
                    time_scale = input;
                }
            } else if (typeof input === 'undefined') {
                time_scale = vv;
            } else if (typeof mv === 'undefined') {
                time_scale = vv;
            } else {
                time_scale = mix_values(vv, input, mv);
            }

            gen_args.scale_time(time_scale);

            return input;
        };
    }};

    _functions.fast = {fun: (args) => {
        const {s: scale, o: offset, m: mix} = expand_args({s: ud, o: 0, m: 0}, args);

        return (input, gen_args, run_args) => {
            const [sv, ov, mv] = freeze_values([scale, offset, mix], run_args, gen_args);
            
            let time_scale = 1;
            if (typeof input === 'undefined') {
                if (typeof sv !== 'undefined') {
                    time_scale = sv;
                }
            } else if (typeof sv === 'undefined') {
                time_scale = input;
            } else {
                time_scale = mix_values(sv, input, mv);
            }

            gen_args.scale_time(time_scale, (v) => ((time_scale * v) + ov));
            
            return input;
        };
    }};

    _functions.slow = {fun: (args) => {
        const {s: scale, o: offset, m: mix} = expand_args({s: ud, o: 0, m: 0}, args);

        return (input, gen_args, run_args) => {
            const [sv, ov, mv] = freeze_values([scale, offset, mix], run_args, gen_args);
            
            let time_scale = 1;
            if (typeof input === 'undefined') {
                if (typeof sv !== 'undefined') {
                    time_scale = sv;
                }
            } else if (typeof sv === 'undefined') {
                time_scale = input;
            } else {
                time_scale = mix_values(sv, input, mv);
            }
            if (time_scale === 0) {
                time_scale = 1;
            }

            gen_args.scale_time(time_scale, (v) => ((v / time_scale) + ov));
            
            return input;
        };
    }};

    _functions.time = {fun: (args) => {
        const {s: scale, o: offset} = expand_args({s: 1, o: 0}, args);

        return (input, gen_args, run_args) => {
            const [sv, ov] = freeze_values([scale, offset], run_args, gen_args);

            return (get_time(gen_args, run_args) * sv) + ov;
        };
    }};
    
    return _functions;
};

export const functions = ({logger = console.log}) => ({
    __category: "time"
    , __doc: {
        title: "Time functions"
        , description: `Functions that affect the time such as slowing it down
or speeding it up`
    }
    , ...(make_functions({logger}))
});
