
This package provides control utilities for the [Hydra visual synthesizer](https://github.com/ojack/hydra). 

# Installation

The easiest way to add this package to your Hydra instance is by getting the
[`hydralfo.min.js`](dist/hydralfo.min.js) from the [dist](dist) directory
and put it in the [`hydra-server/public`](/ojack/hydra/tree/master/hydra-server/public)
directory of Hydra.

Then amend the [`hydra-server/public/index.html`](/ojack/hydra/tree/master/hydra-server/public/index.html)
by adding a new `script` tag to include the file:

```html
  <title>&lt; hydra &gt;</title>
  <script src="./bundle.js"></script>
  <script src="./hydralfo.min.js"></script> <!--  INSERT THIS LINE -->
  <meta charset="UTF-8">
```

# Usage 

Below are some examples on how to use `hydralfo`. You might also be able to find
more information on the [Hydra LFO GitHub Pages](https://oscons.github.io/hydra-lfo)
(work in progress...).

```javascript
L = require('hydralfo').init();

console.log(typeof L.sin()); // === 'function', can be used for Hydra values
console.log(L.sin().run({time: 1})); // you can eavaluate results with .run

// change shapes continously between 4 and <8
shape(
  L.sin({f:0.5, s: 4, o: 4}) // frequency 1/2 times per second, scale 0-4, offset 4
).out(o0)

// change shapes between 4 and <8 in discrete 0.5 size steps
shape(
  L.sin({f:0.5, s: 4, o: 4})
  .mul(2)
  .floor()
  .div(2)
).out(o0)

// functions can be arguments as well
shape(
  L.sin({
    f:0.5
    , s: L.sin({f: 1, o: 2}) // scale for first sin is based on second sin => frequency modulation
    , o: () => 3 + (13 / Math.max(13, window.screen.width / 100)) // you can supply custom functions
  })
).out(o0)

// cycle through shapes every 4 seconds
shape(
  L.slow(4) // slow down time
  .choose([10, 16, 8, 20]) // use it as an index
).out(o0)
```

# Building

```
npm run dist
```

# License

```
Copyright (C) 2019  oscons (github.com/oscons). All rights reserved.
Licensed under the GNU General Public License, Version 2.0.
```

See [LICENSE](LICENSE) file for more information.
