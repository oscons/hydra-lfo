---
name: generator
title: Generator functions
---
# Generator functions



{% assign catfuns = site.functions | where: "fun_cat", "generator" %}
{% for function in catfuns %}
[{{ function.name }} - {{ function.title }}]({{ function.url }})
{% endfor %}
