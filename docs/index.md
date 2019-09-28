---
title: Hydra LFO - Control utilities for Hydra
description: Documentation for the Hydra LFO control function library.
---
# Intro

`Hydra LFO` is a collection of functions that make creating control functions
for Hydra parameters easier.

## tl;dr

Allows you to write something like this:

```javascript
L = hydralfo.init()

shape(3)
    .scale(L.sin(1/4, 5, 2)) // frequency = 1/2, scale=5, offset=2
    .out(o0)
```

Instead of this:

```javascript
shape(7)
    .scale(({time}) => ((Math.sin(time*1/4*2*Math.PI)/2+0.5)*0.5)+0.2)
    .out(o0)
```

## What is Hydra?

[Hydra](https://github.com/ojack/hydra) is an amazing visual synthesizer that
runs in your browser. It supports [live coding](https://en.wikipedia.org/wiki/Live_coding)
of the visuals and is a nice addition for live coded audio, e.g. with [Tidalcycles](https://github.com/tidalcycles/tidal).

Check out [Hydra's GitHub page](https://github.com/ojack/hydra) for more
information on Hydra and links to videos.

## Why would I need Hydra LFO?

Hydra allows controlling parameters with functions instead of hard coded values.
This is akin to the Low Frequency Oscillators (LFO) used in
[modular audio synthesizers](https://en.wikipedia.org/wiki/Modular_synthesizer).

While writing control functions in plain JavaScript is not difficult, it tends
to be pretty verbose and one starts re-implementing functions for every
performance.

The idea of Hydra LFO is to provide a common tool set of LFO and related
functions in a way that's also (somewhat) intelligible for the audience by
naming things after what they do. Combining the simple tools is possible in
a streamlined manner that also conveys the flow of data through the functions.

In the end, the main goal is to stop worrying about writing infrastructure and
boilerplate and concentrate on fiddling with Hydra instead of JavaScript.

# Usage



## Set up

## Hydra

```
H = hydralfo
```

# Examples

{% for example in site.examples %}
## {{ example.title }}
{{ example.content }}
{% endfor %}

## More

{% assign xpage = site.pages | where: "name", "examples.md" | first %}

More examples can be found on the [examples page]({{ xpage.url | relative_url }})

# List of functions

{% assign xpage = site.pages | where: "name", "functions.md" | first %}

[All functions reference on one page]({{ xpage.url | relative_url }})

{% for category in site.categories %}
## [{{ category.title }}]({{ category.url | relative_url }})

{% assign catfun = site.functions | where: "function_category", category.category_name %}

{% for function in catfun %}[{{ function.function_name }}]({{ function.url | relative_url }}) - {% endfor %}{% endfor %}

# Other

{% assign xpage = site.pages | where: "name", "all_pages.md" | first %}

 * [Site index]({{ xpage.url | relative_url }})
