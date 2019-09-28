---
title: Site index
---
{% capture crumb %}
{% endcapture %}

[{{ site.title }}]({{ "/" | relative_url }}) >> Site index
{% assign fpages = site.pages | where_exp: "xpage", "xpage.name != 'index.md'" %}
{% for page in fpages %}
 * [{{ page.title }}]({{ page.url | relative_url }})
{% endfor %}
