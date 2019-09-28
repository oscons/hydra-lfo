---
{
  "function_name": "add",
  "title": "Add a value",
  "function_category": "maths",
  "description": "Add a value to the current value, depending on [`use`](use.html)",
  "doc": {
    "title": "Add a value",
    "command": [
      "add(v)",
      "add({v})"
    ],
    "params": {
      "v": "The value to add. Default is 0"
    },
    "return": "The previous value plus the added value `v`.",
    "description": "Add a value to the current value, depending on [`use`](use.html)",
    "examples": [
      "shape(L.time().mod(3).add(2).floor()).out(o0)",
      "shape(3,L.time().mod(3).div(6).add(L.sin({f:1/2,s:0.2,o:0.1}))).out(o0)"
    ]
  }
}
---
