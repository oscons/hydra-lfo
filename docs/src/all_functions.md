---
title: All functions
name: all_functions
---

# By category
{% for category in site.categories %}
## [{{ category.title }}]({{ category.url }})

{% assign catfun = site.functions | where: "fun_cat", category.name %}

{% for function in catfun %}[{{ function.name }}](#{{ function.name }}) - {% endfor %}{% endfor %}

# By name

{% for function in site.functions %}

## [{{ function.name }}]({{ function.url }})

{{ function.content }}

{% endfor %}
