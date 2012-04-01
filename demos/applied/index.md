---
layout: default
title: Introduction
---

## Introduction

jQuery.LazyJaxDavis is a url router for static websites.  
This makes location changes dynamic using htlm5's history API.

### What jQuery.LazyJaxDavis is for?

Do you usually use history API?  
It's... pushState, replaceState or something like that.  

If you are a developer of JavaScript web applications - and the web apps which you work in are challenging, the answer may be "Yes". But in most of the cases it must be "No" because we need to support old browsers which do not support history API yet. And, when you create static websites which are like - for example, a corporate site, a weblog, or something which is not a web app, it is pretty rare to use history API, I guess.

But, don't you want to make your websites more dynamic and better for user experience with history API? It sounds hard. But I want to say that it's easy! - if you use jQuery.LazyJaxDavis. jQuery.LazyJaxDavis gives you simple API to make it possible.

jQuery.LazyJaxDavis provides nice APIs for static websites development.

### Hey, what about the old browser like IE

New browsers has no problem about history API. But, we need to support old browsers like Internet Explorer 9 or less, of course. So do we need to give up using history API? The answer is "No".

jQuery.LazyJaxDavis does not provide features to the browsers which don't have history API features. This just ignores those browsers. And this bring cool features to the browsers which support history API.

### How does it work?

This website is a document of jQuery.LazyJaxDavis but also its demo.  
Try clicking left navigations in this page. You'll see what jQuery.LazyJaxDavis does if you use a browser which supports history API.

If your browser does not support the history API, nothing happens. Just a location change occurs.

### How can I use this?

This demo site is a good example to understand how jQuery.LazyJaxDavis works.

First, this website has main content area.  
Click the button below to confirm it.

<button id="whatthemaincontent">Let me know what you mean</button>

This is the main area of the website.  
In the case of this website, only the html source in this main area is different among each pages. The html source of Header, footer and sidenav is completely same, right?

So what we should do when the location was changed is - replace the html source in the main area. We don't need to change the source about header, footer and sidenav.

With jQuery.LazyJaxDavis, do like below.

{% highlight javascript %}
$(function(){

  var $root = $('#lazyjaxdavisroot');

  $.LazyJaxDavis({
    everyfetchstart: function(page) {
      window.scrollTo(0, 0);
      $root.css('opacity', 0.6);
    },
    everyfetchsuccess: function(page) {
      var $newcontent = $(page.rip('content')).hide();
      $root.css('opacity', 1).empty().append($newcontent);
      $newcontent.fadeIn();
      page.trigger('pageready');
    }
  });

});
{% endhighlight %}

if you do `$.LazyJaxDavis()`, all links and form submits are hijacked. Instead of normal location change, jQuery.LazyJaxDavis does pushState and fetch the target page using `$.ajax`. You need to define what to do when - ajax was started - and,  ajax was completed.

After the ajax thing was done, you can rip the part of the fetched page using `page.ript('content')`. What does this rip from the page? It's the html source in the main area, of course.

But, who can know what the main content is?  
You need to add the comment to the html like below.

{% highlight htl %}
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

The source code between `<!-- LazyJaxDavis start -->` and `<!-- LazyJaxDavis end -->` is the result of `page.ript('content')`. This is what we want. then, manually update the dom on the page.

Basically, that's what jQuery.LazyJaxDavis does.

As you see, this demo site shows nowloading on the left top corner of the browser.

<button id="whattheloading">Let me know what you mean</button>

If you want to do the things like that, just add the code to the event handler `everyfetchstart` and `everyfetchsuccess`.

jQuery.LazyJaxDavis provides only the apis to do things like this.  
So if you want to implement the things like nice loading, it's what you need to code by yourself. To learn more, keep reading the other pages in this document.
