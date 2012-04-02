---
layout: default
title: Lazy Forms
---

## {{ page.title }}

"Lazy forms" mean the forms which jQuery.LazyJaxDavis hijacks.  

### All forms are lazy-forms

As lazy links, jQuery.LazyJaxDavis also hijacks all forms' submit.  
jQuery.LazyJaxDavis supports GET and POST. Try to submit the forms below to confirm those works.

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


