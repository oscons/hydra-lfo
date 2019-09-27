---
layout: default
---
{% capture md %}

{% assign category = site.categories | where: "name", page.fun_cat | first %}


Function {{ page.name }}

------
{% endcapture %}
{{ md | markdownify }}
{{ content }}
{% capture md %}
------

Other functions in [{{ category.title }}]({{ category.url }}):

{% assign ofuncs = site.functions | where: "fun_cat", page.fun_cat %}
{% for ofunc in ofuncs %}
 * [{{ ofunc.name }} - {{ ofunc.title }}]({{ ofunc.url }})
{% endfor %}

Other categories:

{% for cat2 in site.categories %}[{{ cat2.title }}]({{ cat2.url }}) - {% endfor %}

{% assign xpage = site.pages | where: "name", "all_functions.md" | first %}
[All functions reference on one page]({{ xpage.url }})

{% endcapture %}
{{ md | markdownify }}