---
{
  "function_name": "noop",
  "title": "Do nothing",
  "function_category": "general",
  "description": "This function performs no operation. It's mostly used\nfor debugging and testing purposes",
  "doc": {
    "title": "Do nothing",
    "command": [
      "noop()"
    ],
    "params": {},
    "return": "The unmodified input value.",
    "description": "This function performs no operation. It's mostly used\nfor debugging and testing purposes",
    "examples": [
      "L.noop().gen()({val: 2}) // == 2",
      "L.time().noop().run({time: 2}) // == 2"
    ]
  }
}
---
