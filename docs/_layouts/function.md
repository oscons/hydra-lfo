---
layout: default
---
{% capture md %}

{% assign category = site.categories | where: "category_name", page.function_category | first %}


[{{ site.title }}](/) >> [Functions](/functions) >> {{ page.function_name }}

------

# {{ page.function_name }} - {{page.title}}
{{ page.function_description }}
------

Other functions in [{{ category.title }}]({{ category.url }}):

{% assign ofuncs = site.functions | where: "function_category", page.function_category %}
{% for ofunc in ofuncs %}
 * [{{ ofunc.function_name }} - {{ ofunc.title }}]({{ ofunc.url }})
{% endfor %}

Other categories:

{% for cat2 in site.categories %}[{{ cat2.title }}]({{ cat2.url }}) - {% endfor %}

{% assign xpage = site.pages | where: "name", "functions.md" | first %}
[All functions reference on one page]({{ xpage.url }})

{% endcapture %}
{{ md | markdownify }}