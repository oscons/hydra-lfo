---
layout: default
---
{% capture crumb %}
[{{ site.title }}]({{ "/" | relative_url }}) >> [Examples]({{ "/examples" | relative_url }}) >> {{ page.title }}
{% endcapture %}
{% capture md %}
{{ crumb }}

# {{ page.title }}
{% endcapture %}
{{ md | markdownify }}
{{ content }}
{% capture md %}

--------
{{ crumb }}
{% endcapture %}
{{ md | markdownify }}