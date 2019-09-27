---
layout: default
---
{% capture md %}

[{{ site.title }}]({{ "/" | relative_url }}) >> [Categories]({{ "/categories" | relative_url }}) >> {{ page.title }}
------

# {{ page.title }}

{{ page.category_description }}

{% assign catfuns = site.functions | where: "function_category", page.category_name %}
{% for function in catfuns %}
[{{ function.function_name }} - {{ function.title }}]({{ function.url | relative_url }})
{% endfor %}
------
{% endcapture %}
{{ md | markdownify }}