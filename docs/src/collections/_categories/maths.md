---
name: maths
title: Math functions
---
# Math functions



{% assign catfuns = site.functions | where: "fun_cat", "maths" %}
{% for function in catfuns %}
[{{ function.name }} - {{ function.title }}]({{ function.url }})
{% endfor %}
