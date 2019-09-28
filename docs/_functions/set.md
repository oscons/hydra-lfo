---
{
  "function_name": "set",
  "title": "Set a value",
  "function_category": "general",
  "description": "Set the ",
  "doc": {
    "title": "Set a value",
    "command": [
      "set(v, t)",
      "set({v, t})"
    ],
    "params": {
      "v": "The value to set. This can either be a scalar value or a\nfunction that returns a scalar value."
    },
    "return": "The set value",
    "description": "Set the ",
    "see_also": [
      "use",
      "time"
    ],
    "examples": [
      "Shape(L.set(5))",
      "Shape(L.set(({time}) => time % 5))",
      "Shape(L.set(({time}) => time + 5).)"
    ]
  }
}
---
