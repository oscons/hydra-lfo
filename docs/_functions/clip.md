---
{
  "function_name": "clip",
  "title": "Clip a value between two thresholds",
  "function_category": "modifiers",
  "description": "Allows you to ensure the values are within an aceptable\nrange for the following operations.",
  "doc": {
    "title": "Clip a value between two thresholds",
    "command": [
      "clip(u, l, s)",
      "clip({u, l, s})"
    ],
    "params": {
      "u": "Upper bound. Default is 1",
      "l": "Lower bound. Default is 0",
      "s": "Scale to apply to inpcoming value *before* clipping. Default is 1",
      "o": "Offset to add *after* clipping. Default is 0"
    },
    "return": "A value in the range of `[l, u] + o`.",
    "description": "Allows you to ensure the values are within an aceptable\nrange for the following operations.",
    "examples": [
      "shape(3).rotate(\n    L.set(L.time(), 'init')\n        .use('init')\n        .map((x, {time}) => time - x)\n        .clip(10)\n        .map((x) => (10 - x)/10)\n        .rad()\n).out(o0);"
    ]
  }
}
---
