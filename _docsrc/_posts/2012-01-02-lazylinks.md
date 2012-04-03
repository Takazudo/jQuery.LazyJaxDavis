---
layout: default
title: Lazy links/forms
---

## {{ page.title }}

With jQuery.LazyJaxDavis, all links and forms invokes ajax instead.  
You can handle them with one specified rule. I call this lazy.

### Lazy links

"Lazy links" mean the anchors which jQuery.LazyJaxDavis hijacks.  
If you use jQuery.LazyJaxDavis, Each normal links' click invokes LazyJaxDavis's navigation behavior. LazyJaxDavis observes all links' click using jQuery's delegate. LazyJaxDavis hijacks all links as default. You should set `fetchstart` and `fetchsuccess` events to make your site work.

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

### Anchors to other domains

All anchors whose `href` starts with `http` will automatically become no-lazy links. This is why history API doesn't allow this for security. Give up about that.

### Let me define which anchors to be hijacked

You can define what elements to be hijacked like below.  

{% highlight javascript %}
$.LazyJaxDavis(function(router){
  router.option({
    davis: {
      linkSelector: 'a:not([href^=#]):not(.apply-nolazy)'
    }
  });
});
{% endhighlight %}

As default, jQuery.LazyJaxDavis hijacks `'a:not([href^=#]):not(.apply-nolazy)'`. Anchors to the id on the same page should not be contained in here.

### Lazy forms

"Lazy forms" mean the forms which jQuery.LazyJaxDavis hijacks.  
As lazy links, jQuery.LazyJaxDavis also hijacks all forms' submit.  
jQuery.LazyJaxDavis supports GET and POST. Try to submit the forms below to confirm those works.

Note: Sorry, this "POST" form doesn't work on this GitHub server because this server doesn't allow "POST" method. Clone the repository to your local to confirm these. Instead, you can check `everyfetchfail` event here, haha.

<div class="mod-forms">
	<div class="h">GET</div>
	<form action="{{ site.basedir }}/gettest.html" method="get">
		<input type="text" value="getformtest" name="getval"> <input type="submit" value="go">
	</form>
	<div class="h">POST</div>
	<form action="{{ site.basedir }}/posttest.html" method="post">
		<input type="text" value="postformtest" name="postval"> <input type="submit" value="go">
	</form>
</div>

{% highlight html %}
<form action="{{ site.basedir }}/gettest.html" method="get">
	<input type="text" value="getformtest" name="getval"> <input type="submit" value="go">
</form>
{% endhighlight %}
{% highlight html %}
<form action="{{ site.basedir }}/posttest.html" method="post">
	<input type="text" value="postformtest" name="postval"> <input type="submit" value="go">
</form>
{% endhighlight %}

### No-lazy forms

As lazy links, you can avoid the ajax behavior to add `apply-nolazy` to the form's class attributes.

<div class="mod-forms">
	<div class="h">GET (no-lazy)</div>
	<form action="{{ site.basedir }}/gettest.html" method="get" class="apply-nolazy">
		<input type="text" value="getformtest" name="getval"> <input type="submit" value="go">
	</form>
	<div class="h">POST (no-lazy)</div>
	<form action="{{ site.basedir }}/posttest.html" method="post" class="apply-nolazy">
		<input type="text" value="postformtest" name="postval"> <input type="submit" value="go">
	</form>
</div>

{% highlight html %}
<form action="{{ site.basedir }}/gettest.html" method="get" class="apply-nolazy">
	<input type="text" value="getformtest" name="getval"> <input type="submit" value="go">
</form>
{% endhighlight %}
{% highlight html %}
<form action="{{ site.basedir }}/posttest.html" method="post" class="apply-nolazy">
	<input type="text" value="postformtest" name="postval"> <input type="submit" value="go">
</form>
{% endhighlight %}

### Make url routings for POST receivers

If you handle form POST with jQuery.LazyJaxDavis, you need to make url routings for POST receiver pages like below.

{% highlight javascript %}
$.LazyJaxDavis(function(router){
	router.route([
		{
			path: '{{ site.basedir }}/posttest.html',
			method: 'POST'
		}
	]);
});
{% endhighlight %}

As default jQuery.LazyJaxDavis handles all incoming requests as GET. You need to override this to add `method: 'POST'` to url routing.

### POST submit doesn't change url

If you submit with lazy forms as above, the url displayed in the location bar is still unchanged. This is why Davis.js works like this. I think this doesn't make any trouble. But please keep in mind about this.



