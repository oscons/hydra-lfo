
This package provides control utilities for the [Hydra visual synthesizer](https://github.com/ojack/hydra-synth). Visit the [Hydra LFO GitHub Pages](https://oscons.github.io/hydra-lfo) for documentation.

# Building

```
npm run dist
```

# Usage

```javascript
L = require('hydralfo');

// change shapes continously between 4 and <8
shape(
  L.sin({f:0.5, s: 4, o: 4}) // frequency 1/2 times per second, scale 0-4, offset 4
).out(o0)

// change shapes continously between 4 and <8 in discrete 0.5 size steps
shape(
  L.sin({f:0.5, s: 4, o: 4})
  .mul(2)
  .floor()
  .div(2)
).out(o0)

// arguments can be functions as well
shape(
  L.sin({
    f:0.5
    , s: L.sin({o: 2}) // scale for first sin is based on second sin
    , o: () => 3 + (13 / Math.max(13, window.screen.width / 100)) // you can supply custom functions
  })
).out(o0)


// cycle through shapes every 4 seconds
shape(
  L.slow(4) // slow down time
  .time() // get the current time
  .choose([10, 16, 8, 20]) // use it as an index
).out(o0)
```

