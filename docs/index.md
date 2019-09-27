---
title: Hydra LFO - Control utilities for Hydra
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
