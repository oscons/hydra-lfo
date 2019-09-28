---
layout: default
---
{% capture crumb %}
[{{ site.title }}]({{ "/" | relative_url }}) >> [Functions]({{ "/functions" | relative_url }}) >> {{ page.function_name }}
{% endcapture %}
{% capture md %}
{{ crumb }}

{% assign category = site.categories | where: "category_name", page.function_category | first %}

# {{ page.function_name }} - {{page.title}}

{% if page.doc.command %}
```javascript
{% for command in page.doc.command %}{{command}}
{% endfor %}```
{% endif %}

{{ page.doc.description }}

{% if page.doc.params %}
## Parameters

{% if page.doc.params.size > 0 %}

{% for param in page.doc.params %}
- `{{ param[0] }}`: {{ param[1] }}
{% endfor %}

{% else %}
This function takes no parameters.
{% endif %}
{% endif %}

{% if page.doc.return %}
## Returns

{{ page.doc.return }}

{% endif %}

{% if page.doc.examples %}
## Examples
{% for example in page.doc.examples %}
```javascript
{{ example }}
```
{% endfor %}
{% endif %}
------

Other functions in [{{ category.title }}]({{ category.url | relative_url }}):

{% assign ofuncs = site.functions | where: "function_category", page.function_category %}
{% for ofunc in ofuncs %}
 * [{{ ofunc.function_name }} - {{ ofunc.title }}]({{ ofunc.url | relative_url }})
{% endfor %}

Other categories:

{% for cat2 in site.categories %}[{{ cat2.title }}]({{ cat2.url | relative_url }}) - {% endfor %}

{% assign xpage = site.pages | where: "name", "functions.md" | first %}
[All functions reference on one page]({{ xpage.url | relative_url }})

--------
{{ crumb }}
{% endcapture %}
{{ md | markdownify }}