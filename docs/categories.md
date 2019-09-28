---
permalink: /categories/
title: Categories
---
{% capture crumb %}
{% endcapture %}
[{{ site.title }}]({{ "/" | relative_url }}) >> Categories

{% for category in site.categories %}

## [{{ category.title }}]({{ category.url | relative_url }})

{{ category.doc.description }}

{% endfor %}
