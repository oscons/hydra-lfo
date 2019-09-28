---
{
  "function_name": "get",
  "title": "Set the current value to a named one.",
  "function_category": "general",
  "description": "Fetches the value stored with the name `n` and sets it as the current value.",
  "doc": {
    "title": "Set the current value to a named one.",
    "command": [
      "get(n)",
      "get({n})"
    ],
    "params": {
      "n": "The name of the value to get, e.g. `time` to get the current time. Default value is `val`"
    },
    "return": "The value saved unter the name specified by `n`. Can be undefined.",
    "description": "Fetches the value stored with the name `n` and sets it as the current value.",
    "examples": [
      "shape(3, L.get('time').mul(2).use('time', true).sin(1, 0.5, 0.5)).out(o0)"
    ]
  }
}
---
