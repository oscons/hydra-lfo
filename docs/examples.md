---
title: Examples
permalink: /examples/
description: Examples for the Hydra-LFO control function library.
---
{% capture crumb %}
[{{ site.title }}]({{ "/" | relative_url }}) >> Examples
{% endcapture %}
{{ crumb }}

# Examples
{% for example in site.examples %}
## {{ example.title }}
{{ example.content }}
{% endfor %}

--------
{{ crumb }}
