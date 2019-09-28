---
{
  "function_name": "use",
  "title": "Set the currently modified value.",
  "function_category": "general",
  "description": "You can manipulate a custom list of values which\nyou can refer to by name. The `val` value is the default used initially.\nThe last value that's in `use` will be what the LFO function finally returns.\n\nThough `fast` and\nthe likes are the preferred way to manipulate time you can also use\n`use('time')` to manipulate time directly or return its value from the LFO \nfunction.",
  "doc": {
    "title": "Set the currently modified value.",
    "command": [
      "use(n, c)",
      "use({n, c})"
    ],
    "params": {
      "n": "The name of the value. The default value is `val`. You can\nmanipulate `time` or `bpm` or any other string value as well.",
      "c": "Should the currently in use value be copied over to the new on\none. Either `true` to copy or `false` to keep the value untouched. Defaul\nis `false`"
    },
    "return": "The currently in use value.",
    "description": "You can manipulate a custom list of values which\nyou can refer to by name. The `val` value is the default used initially.\nThe last value that's in `use` will be what the LFO function finally returns.\n\nThough `fast` and\nthe likes are the preferred way to manipulate time you can also use\n`use('time')` to manipulate time directly or return its value from the LFO \nfunction.",
    "examples": [
      "shape(L.set(10).use('time').mul(2).use('val')).out(o0)",
      "shape(10, L.use('time').add(1).use('val').sin().add(1)).out(o0)"
    ]
  }
}
---
