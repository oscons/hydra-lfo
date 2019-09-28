---
{
  "function_name": "floor",
  "title": "Roud down to the nearest number of digits",
  "function_category": "maths",
  "description": "Rounds the current value down to the specified number of decimal places. This can\nbe used to discretize continous valued functions.",
  "doc": {
    "title": "Roud down to the nearest number of digits",
    "command": [
      "floor(d)",
      "floor({d})"
    ],
    "params": {
      "d": "The number of digits after the decimal point to round down to.\nDefault is 0 which is effectively the nearest lower integer."
    },
    "return": "Rounded value",
    "description": "Rounds the current value down to the specified number of decimal places. This can\nbe used to discretize continous valued functions.",
    "examples": [
      "shape(3).scrollY(L.range({u:10,s:0.5}).floor(1)).out(o0)"
    ]
  }
}
---
