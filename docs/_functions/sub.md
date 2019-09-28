---
{
  "function_name": "sub",
  "title": "Subtract a value",
  "function_category": "maths",
  "description": "Subtract a value from the current value, depending on [`use`](use.html)",
  "doc": {
    "title": "Subtract a value",
    "command": [
      "sub(v)",
      "sub({v})"
    ],
    "params": {
      "v": "The value to subtract. Default is 0"
    },
    "return": "The previous value minus the subtracted value `v`.",
    "description": "Subtract a value from the current value, depending on [`use`](use.html)",
    "examples": [
      "shape(3).scrollY(-0.2).rotate(L.time().mod(10).sub(5).floor().rad(1/10)).out(o0)"
    ]
  }
}
---
