---
{
  "function_name": "used",
  "title": "Return the name of the currently in `use` value",
  "function_category": "general",
  "description": "This function allows you to retrieve the name of the\ncurrent default parameter that is modufied by functions like `mul` or `set`.\n\nThis is usually most helpful for debugging purposes, though you could use it in\n`map` too.",
  "doc": {
    "title": "Return the name of the currently in `use` value",
    "command": [
      "used()"
    ],
    "params": {},
    "return": "The name set by the last `use` command or `val` if not set at all.",
    "description": "This function allows you to retrieve the name of the\ncurrent default parameter that is modufied by functions like `mul` or `set`.\n\nThis is usually most helpful for debugging purposes, though you could use it in\n`map` too.",
    "examples": [
      "console.log(L.used()) // == 'val'",
      "console.log(L.use('time').used()) == 'time'",
      "\nshape(3)\n    .rotate(\n        L.use(() => time % 2 < 1 ? \"cos\" : \"sin\"))\n            .used()\n            .map((x, {time}) => eval(`Math.${x}(time)`))\n            .mul(2)\n    ).out(o0)\n"
    ]
  }
}
---
