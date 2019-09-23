
This package provides control utilities for the [Hydra visual synthesizer](https://github.com/ojack/hydra-synth). Visit the [Hydra LFO GitHub Pages](https://oscons.github.io/hydra-lfo) for documentation.

# Building

```
npm run dist
```

# Usage

```javascript
L = require('hydralfo');

// change shapes continously between 4 and <8
shape(L.sin({f:0.5, s: 4, o: 4})).out(o0)

// change shapes continously between 4 and <8 in discrete 0.5 size steps
shape(L.sin({f:0.5, s: 4, o: 4}).mul(2).floor().div(2)).out(o0)

// cycle through shapes every 4 seconds
shape(L.slow(4).time().floor().choose([10, 16, 8, 20])).out(o0)
```
