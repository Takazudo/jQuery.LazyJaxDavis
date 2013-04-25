---
layout: default
title: Anchor handling
---

## {{ page.title }}

Basically, you don't need to care about the anchor links.  
jQuery.LazyJaxDavis handles them automatically.


### Anchor to the id on the same page

jQuery.LazyJaxDavis doesn't invoke ajax with the anchor click like below.  
These are just the anchor link.

{% highlight html %}
<a href="#main">link to the id on the same page</a>
{% endhighlight %}

Click the link below to confirm.

* [#main](#main)


### Anchor to the id on another page

This is a little tricky thing.  
Because without jQuery.LazyJaxDavis, the browser does full page redraw. Then it automatically scroll to the element.

{% highlight html %}
<a href="somewhere.html#main">link to the id on another page</a>
{% endhighlight %}

But with jQuery.LazyJaxDavis, the browser does not do the scrolling because there is not the specified element in the page. It will be on the page after the refresh was complete. To handle this, jQuery.LazyJaxDavis does scrolling like below as default.

{% highlight javascript %}
Page.prototype._anchorhandler = function(hash) {
  var top;
  if (!hash) return this;
  top = ($(document).find(hash)).offset().top;
  window.scrollTo(0, top);
  return this;
};
{% endhighlight %}

Click the links below to confirm this.

<ul>
	<li><a href="{{ site.basedir }}/#main">{{ site.basedir }}/#main</a></li>
	{% for post in site.posts %}
		{% if post.title != page.title %}
			<li><a href="{{ site.basedir }}{{ post.url }}#main">{{ site.basedir }}{{ post.url }}#main</a></li>
		{% endif %}
	{% endfor %}
</ul>

This anchor handing method will be called after the 'pageready' event automatically. This means that jQuery.LazyJaxDavis does scrolling manually after the page refresh was done.

### Override anchorhandler

If you don't like this behavior, you can override this anchorhandler with the code like below.

{% highlight javascript %}
new $.LazyJaxDavis(function(router){

  router.option({
    anchorhandler: function(hash){
      console.log(hash); // "#main"
      doMySmoothScrollTo(hash); // do your own scrolling
    }
  });

});
{% endhighlight %}

You can use smoothcroll library or something with the code like above.

This feature is available within URL routing too.

{% highlight javascript %}
new $.LazyJaxDavis(function(router){

  router.route({
    path: '/somewhere/foobar.html',
    anchorhandler: function(hash){
      console.log(hash); // #main
      doMySmoothScrollTo(hash); // do your own scrolling
    }
  });

]);
{% endhighlight %}

With the code above, the anchorhandler will be overridden only if the URL was `/somewhere/foobar.html`.

I made a demo for how to tweak anchorhandler. Check this if interested.

* [Demo - Customize anchorhandler with smooth scrolling]({{ site.basedir }}/pages/demos.html#smooth)
