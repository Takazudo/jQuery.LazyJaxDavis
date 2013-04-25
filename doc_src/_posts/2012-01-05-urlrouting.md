---
layout: default
title: URL routing
---

## {{ page.title }}

You can define custom events for specific URLs using URL routing.

### Basics

Pass the array of URL routing configs to the `route` method like below.

{% highlight javascript %}
new $.LazyJaxDavis(function(router){

  ...

  router.route([
    {
      path: '/somewhere/1.html',
      ignoregetvals: true,
      fetchstart: function(page){ alert('1.html fetchstart!'); },
      fetchsuccess: function(page){ alert('1.html fetchsuccess!'); },
      pageready: function(){ alert('1.html pageready!'); }
    },
    {
      path: /anycategory\/foobar/,
      fetchstart: function(page){ alert('2.html fetchstart!'); },
      fetchsuccess: function(page){ alert('2.html fetchsuccess!'); },
      pageready: function(){ alert('2.html pageready!'); }
    }
  ]);

});
{% endhighlight %}

With URL routing, you can set events for each specific URLs. These event handlers will be fired only if the path was matched. Events below are available for this.

* fetchstart
* fetchsuccess
* fetchfail
* fetchabort
* pageready

These are path-pecific ones of everyxxxxxx event which I already wrote. As `path`, you can set string or regexp to define which page to be applied.

These routings' paths cannot be conflicted each other. This is pretty important. if jQuery.LazyJaxDavis found plural matched config about a URL, it shows error.

If you specify `ignoregetvals: true` to any, get values like `?foo=bar` in the URL will be ignored about these path rules.

### Transparent routing

As I wrote above, each routings cannnot be conflicted. But, it's possible. If you like to do complicated routing, use transparent routing feature like below. I introduced this more on [demo]({{ site.basedir }}/pages/demos.html#transparent) page.

{% highlight javascript %}
new $.LazyJaxDavis(function(router){

  ...

  router.route([
    {
      path: /\/pages\/2010\//,
      fetchstart: function(){ ...  },
      fetchsuccess: function(){ ...  },
      pageready: function(){ ... }
    },
    {
      path: /\/pages\/2011\//,
      fetchstart: function(){ ... },
      fetchsuccess: function(){ ... },
      pageready: function(){ ... }
    }
  ]);

  router.routeTransparents([
    {
      path: /\/pages\//,
      pageready: function(){
        /* do some thing for all /pages/ here */
      }
    }
  ]);

});
{% endhighlight %}

Transparent routing is a feature for groups of pages.
