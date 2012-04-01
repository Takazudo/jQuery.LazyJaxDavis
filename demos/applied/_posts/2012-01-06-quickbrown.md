---
layout: default
title: handle anchors
---

## About anchors

<ul>
	<li><a href="{{ site.basedir }}/#main">{{ site.basedir }}/#main</a></li>
	{% for post in site.posts %}
		<li><a href="{{ site.basedir }}{{ post.url }}#main">{{ site.basedir }}{{ post.url }}#main</a></li>
	{% endfor %}
</ul>
