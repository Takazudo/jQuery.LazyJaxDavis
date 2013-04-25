---
layout: default
title: Introduction
titleoverride: jQuery.LazyJaxDavis
---

## Introduction

JQuery.LazyJaxDavis brings the power of history.pushState to static websites.  
This changes all location changes to dynamic - ajax based.  
Flexible URL routing feature is also available.

### HTML5 history API and us

Do you usually use history API?  
It's... pushState, replaceState or something like that.  

If you are a developer of JavaScript web app - and the web apps which you work in are challenging, the answer may be "Yes". But in most of the cases it must be "No" because we usually need to support old browsers which do not support history API yet. And, when you create static websites which are like - for example, a corporate site, a weblog, or something which is not a web app, it is pretty rare to use history API, I guess.

### jQuery.LazyJaxDavis stands on history API

But, don't you want to make your websites more dynamic and better for user experience with history API? It sounds hard. But I want to say that it's easy! - if you use jQuery.LazyJaxDavis. jQuery.LazyJaxDavis gives you simple API to make it possible.

jQuery.LazyJaxDavis provides nice APIs for static websites development.

### About the old browsers like IE

New browsers has no problem about history API. But, we need to support old browsers like Internet Explorer 9 or less in most cases. So do we need to give up using history API? The answer is "No".

jQuery.LazyJaxDavis does not provide nice features to the browsers which don't have history API spoort. But this also works with old browsers gracefully.

### Tell me what does jQuery.LazyJaxDavis do

The basic feature of jQuery.LazyJaxDavis is "change all location-changes to dynamic - ajax based". This website is a document of jQuery.LazyJaxDavis but is also its demo site. Try clicking left navigations in this page. You'll see what jQuery.LazyJaxDavis does if you use a browser which supports history API.

If your browser does not support the history API, nothing happens. Just a normal location change occurs.

### Short explanation about this website

I'll explain how this website works in short.  
First, this website has main content area. Click the button below.  
Scroll up to the top. Then scroll down to the bottom. You can understand what the main content is.

<button id="whatthemaincontent">Let me know what you mean</button>

This is the main area of the website.  
In the case of this website, only the html source in this main area is different among each pages. The html source of Header, footer and sidenav is completely same, right?

So what we should do when the location was changed is - replace the html source in the main area. We don't need to change the source about header, footer and sidenav.

With jQuery.LazyJaxDavis, do like below on documentready.

{% highlight javascript %}
new $.LazyJaxDavis(function(router){

  var $root = $('#lazyjaxdavisroot'); // main content wrapper

  // do this when page fetching was started
  router.bind('everyfetchstart', function(page) {

    // scrollup
    window.scrollTo(0, 0);
    // add a little transparency for loading
    $root.css('opacity', 0.6);

  });

  // do this when page fetching was successed
  router.bind('everyfetchsuccess', function(page) {
    
    // rip new content
    var newcontent = page.rip('content');
    // hide it on the fly
    var $newcontent = $(newcontent).hide();
    // replace with it
    $root.css('opacity', 1).empty().append($newcontent); 
    // show the new content
    $newcontent.fadeIn();
    // tell jQuery.LazyJaxDavis that the page is ready now
    page.trigger('pageready');

  });

});
{% endhighlight %}

if you do `new $.LazyJaxDavis()`, all links and form submits are hijacked. Instead of normal location change, jQuery.LazyJaxDavis does pushState and fetch the target page using `$.ajax`. You need to define what to do when - ajax was started - and,  ajax was completed.

After the ajax thing was done, you can rip the part of the fetched page using `page.rip('content')`. What does this rip from the page? It's the html source in the main area, of course.

But, how can it know what the main content is?  
You need to add the comment to the html like below.

{% highlight html %}
<div class="mod-body">
  sidenav here
  <div class="mod-main">
    <div id="lazyjaxdavisroot">
    <!-- LazyJaxDavis start -->

      <div class="mod-article">
        main content blah blah blah
      </div>

    <!-- LazyJaxDavis end -->
    </div>
  </div>
</div>
{% endhighlight %}

The source code between `<!-- LazyJaxDavis start -->` and `<!-- LazyJaxDavis end -->` is the result of `page.rip('content')`. This is what we want. Then, add the code to update the dom on the page.

Basically, that's what jQuery.LazyJaxDavis does.  

As you see, this demo site shows nowloading on the left top corner of the browser.

<button id="whattheloading">Let me know what you mean</button>

If you want to do the things like that, just add the code to the event handler `everyfetchstart` and `everyfetchsuccess`.

jQuery.LazyJaxDavis provides only the apis to do things like this.  
So if you want to implement the things like nice loading, it's what you need to code by yourself.

To learn more, keep reading the other pages in this document.
