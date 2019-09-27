---
permalink: /categories/
---

{% for category in site.categories %}

[{{ category.title }}]({{ category.url }})

{% endfor %}
