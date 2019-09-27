---
title: Hydra LFO - Control utilities for Hydra
permalink: /
---

# Intro

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

More examples can be found on the [examples page]({{ xpage.url }})

# List of functions

{% assign xpage = site.pages | where: "name", "all_functions.md" | first %}

[All functions reference on one page]({{ xpage.url }})

{% for category in site.categories %}
## [{{ category.title }}]({{ category.url }})

{% assign catfun = site.functions | where: "fun_cat", category.name %}

{% for function in catfun %}[{{ function.name }}]({{ function.url }}) - {% endfor %}{% endfor %}

# Other

{% assign xpage = site.pages | where: "name", "all_pages.md" | first %}

 * [Site index]({{ xpage.url }})
