---
name: time
title: Time functions
---
# Time functions



{% assign catfuns = site.functions | where: "fun_cat", "time" %}
{% for function in catfuns %}
[{{ function.name }} - {{ function.title }}]({{ function.url }})
{% endfor %}
