---
layout: default
title: Lazy links
---

## {{ page.title }}

"Lazy links" mean the anchors which jQuery.LazyJaxDavis hijacks.  

### All links are lazy-links

If you use jQuery.LazyJaxDavis, Each normal links' click invokes LazyJaxDavis's navigation behavior. LazyJaxDavis observes all links' click using jQuery's delegate. LazyJaxDavis hijacks all links as default. You should set "fetchstart" and "fetchsuccess" events to make your site work.

### No-lazy links

Even if you want to use jQuery.LazyJaxDavis, you may not want to attach the ajax behavior for some anchors. For example, the anchors which refer imgs or pdf should not to be handled by jQuery.LazyJaxDavis. As default, you can avoid this by attaching `apply-nolazy` to the class attribute of the anchor like below.

{% highlight html %}
<a href="somewhere.html" class="apply-nolazy">Let me avoid the lazy thing</a>
{% endhighlight %}

Click the links below to confirm this.

<div class="mod-nolazytestnav">
	<div class="mod-nolazytestnav-lazy">
		<div class="h">Lazy links</div>
		<div class="p">These links has no class attribute.</div>
		<ul>
			<li><a href="{{ site.basedir }}/">Introduction</a></li>
			{% for post in site.posts reversed %}
				<li><a href="{{ site.basedir }}{{ post.url }}">{{ post.title }}</a></li>
			{% endfor %}
		</ul>
	</div>
	<div class="mod-nolazytestnav-nolazy">
		<div class="h">No-lazy links</div>
		<div class="p">These links has <code>class="apply-nolazy"</code>.</div>
		<ul>
			<li><a class="apply-nolazy" href="{{ site.basedir }}/">Introduction</a></li>
			{% for post in site.posts %}
				<li><a class="apply-nolazy" href="{{ site.basedir }}{{ post.url }}">{{ post.title }}</a></li>
			{% endfor %}
		</ul>
	</div>
</div>

### Let me define which anchors to be hijacked

You can define what elements to be hijacked like below.  

{% highlight javascript %}
$.LazyJaxDavis({

  // do other initial setups here

  davis: {
    linkSelector: 'a:not([href^=#]):not(.apply-nolazy)'
  }

});
{% endhighlight %}

As default, jQuery.LazyJaxDavis hijacks `'a:not([href^=#]):not(.apply-nolazy)'`. Anchors to the id on the same page should not be contained in here.


