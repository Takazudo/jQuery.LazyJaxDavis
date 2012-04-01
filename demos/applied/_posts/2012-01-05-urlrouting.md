---
layout: default
title: URL routing
---

## {{ page.title }}

You can define custom events for specific urls using URL routing.

### How to define URL routings

Pass the array of url routing items as the second argument like below.

{% highlight javascript %}
$.LazyJaxDavis(options, [
  {
    path: '/somewhere/1.html',
    fetchstart: function(page){
      alert('1.html fetchstart!');
    },
    fetchsuccess: function(page){
      alert('1.html fetchsuccess!');
    },
    pageready: function(){
      alert('1.html pageready!');
    }
  },
  {
    path: '/somewhere/2.html',
    fetchstart: function(page){
      alert('2.html fetchstart!');
    },
    fetchsuccess: function(page){
      alert('2.html fetchsuccess!');
    },
    pageready: function(){
      alert('2.html pageready!');
    }
  },
]);
{% endhighlight %}

With URL routing, you can set events for each specific URLs. These event handlers will be fired only if the path was matched. Events below are available for this.

* fetchstart
* fetchsuccess
* fetchfail
* pageready

These are path pecific ones of every-foo event which you already know.

