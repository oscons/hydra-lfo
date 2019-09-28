---
title: All functions
permalink: /functions/
---
{% capture crumb %}
[{{ site.title }}]({{ "/" | relative_url }}) >> Functions
{% endcapture %}
{{ crumb }}
# By category
{% for category in site.categories %}
## [{{ category.title }}]({{ category.url | relative_url }})

{% assign catfun = site.functions | where: "function_category", category.category_name %}

{% for function in catfun %}[{{ function.function_name }}](#{{ function.function_name }}) - {% endfor %}{% endfor %}

# By name

{% for function in site.functions %}

### [{{ function.function_name }}]({{ function.url | relative_url }})

{{ function.title }}

{% if function.doc.description %}{{ function.doc.description }}{% endif %}

{{ function.function_description }}
{% endfor %}
--------
{{ crumb }}
