---
title: All functions
permalink: /functions/
---

# By category
{% for category in site.categories %}
## [{{ category.title }}]({{ category.url | relative_url }})

{% assign catfun = site.functions | where: "function_category", category.category_name %}

{% for function in catfun %}[{{ function.function_name }}](#{{ function.function_name }}) - {% endfor %}{% endfor %}

# By name

{% for function in site.functions %}

 * [{{ function.function_name }}]({{ function.url | relative_url }}) - {{ function.title }}

{{ function.function_description }}

{% endfor %}
