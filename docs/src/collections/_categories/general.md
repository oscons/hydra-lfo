---
name: general
title: General functions
---
# General functions



{% assign catfuns = site.functions | where: "fun_cat", "general" %}
{% for function in catfuns %}
[{{ function.name }} - {{ function.title }}]({{ function.url }})
{% endfor %}
