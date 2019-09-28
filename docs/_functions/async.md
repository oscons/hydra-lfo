---
{
  "function_name": "async",
  "title": "Asynchronously execute a function",
  "function_category": "async",
  "description": "The provided function is run with a frequency of `r`\nper time unit. All parameters are based on the current `time` and `bpm`,\nassuming `time` is in beats. Timing is not guaranteed, so `f` might drift\nover time.\n\nInternally async is implemented using setTimeout with all implications regarding\nexecution context.",
  "doc": {
    "title": "Asynchronously execute a function",
    "command": [
      "async(f, r, d)",
      "async({f, r, d})"
    ],
    "params": {
      "f": "Function to execute. Default is `() => {}`",
      "r": "Run frequency of the function. A value of `0` or less will\nresult in the function being called only once. Default is `1`",
      "d": "Delay before first run. Default is `0`"
    },
    "return": "The unaltered input value.",
    "description": "The provided function is run with a frequency of `r`\nper time unit. All parameters are based on the current `time` and `bpm`,\nassuming `time` is in beats. Timing is not guaranteed, so `f` might drift\nover time.\n\nInternally async is implemented using setTimeout with all implications regarding\nexecution context.",
    "examples": [
      "const x = {v: 3};\nshape(\n    L.async(() => x.v = ((x.v + 1 ) % 5) + 3)\n        .set(() => x.v)\n).out(o0);"
    ]
  }
}
---
