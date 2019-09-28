---
layout: default
---
{% capture crumb %}
[{{ site.title }}]({{ "/" | relative_url }}) >> [Categories]({{ "/categories" | relative_url }}) >> {{ page.title }}
{% endcapture %}
{% capture md %}

{{ crumb }}

# {{ page.title }}

{{ page.category_description }}

{% assign catfuns = site.functions | where: "function_category", page.category_name %}
{% for function in catfuns %}
[{{ function.function_name }} - {{ function.title }}]({{ function.url | relative_url }})
{% endfor %}

--------
{{ crumb }}

{% endcapture %}
{{ md | markdownify }}