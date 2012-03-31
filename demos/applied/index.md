---
layout: default
title: Top page
---

## Introduction

jQuery.LazyJaxDavis is a url router for static websites using htlm5's history API.

### What jQuery.LazyJaxDavis is for?

Do you usually use history API?  
It's... pushState, replaceState or something like that.  

If you are a developer of JavaScript web applications - and the web app which you work in are pretty challenging, the answer may be "Yes". But in most of the cases it must be "No", I guess. And, when you create static websites which are - for example, a corporate site, a weblog, or something which are not web applications, it is pretty rare to use history API, I think.

But, don't you want to make your websites more dynamic and better for user experience with history API? It sounds hard but it's easy - if you use jQuery.LazyJaxDavis. jQuery.LazyJaxDavis gives you simple API to make it possible.

jQuery.LazyJaxDavis provide easy APIs for static websites.

### Hey, what about the old browser like IE

New browsers has no problem about history API. But, we need to support them, of course. So do we need to give up using history API? The answer is "No".

jQuery.LazyJaxDavis does not provide dynamic features to the browsers which don't have history API features. This just ignores those browsers. And this bring cool features to the browsers which support history API.

### How does it work?

This website is a document of jQuery.LazyJaxDavis but also a demo of it.  
Try clicking left navigations or links in this page. You'll see what jQuery.LazyJaxDavis does... if you use a browser which supports history API.

### How can I use this?

This demo site is a good example to understand how jQuery.LazyJaxDavis works.

First, this website has main content area.  
Click the button below to confirm it.

<button id="whatthemaincontent">Let me know what you mean</button>
<script>
(function(){
	var $btn = $('#whatthemaincontent');
	var $root = $('#lazyjaxdavisroot');
	var hilighted = false;
	$btn.click(function(){
		if(hilighted){
			hilighted = false;
			$root.css('background', 'none');
			$btn.html('Let me know what you mean');
		}else{
			hilighted = true;
			$root.css('background', '#faa');
			$btn.html('OK, bring me back');
		}
	});
})();
</script>

This is the main area of the website.  
In the case of this website, only the html source in this main area is different among each pages. The html source of Header, footer and sidenav is completely same, right?

So what we should do when the location was changed is - replace the html source in the main area. We don't need to change the source about header, footer and sidenav. jQuery.LazyJaxDavis helps you to do this.

With jQuery.LazyJaxDavis, do like below.

{% highlight javascript %}
$(function(){

  var $root = $('#lazyjaxdavisroot');

  $.LazyJaxDavis({
    everyfetchstart: function(page) {
      window.scrollTo(0, 0);
      $root.css('opacity', 0.6);
    },
    everyfetchend: function(page) {
      var $newcontent = $(page.rip('content')).hide();
      $root.css('opacity', 1).empty().append($newcontent);
      $newcontent.fadeIn();
    }
  });

});
{% endhighlight %}

if you do $.LazyJaxDavis(), all links and form submits are hijacked. Instead of location change, jQuery.LazyJaxDavis does pushState and fetch the target page using jQuery.ajax. You need to define what to do when - ajax was started - and,  ajax was done.

After the ajax thing was done, you can rip the part of the fetched page using page.ript('content'). What does this rip from the page? It's the html source in the main area, of course. But, you need to add the comment to the html like below.

{% highlight javascript %}
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

The source code between `<!-- LazyJaxDavis start -->` and `<!-- LazyJaxDavis end -->` are the result of `page.ript('content')` is what you want. then, update the page.

Basically, that's what jQuery.LazyJaxDavis does.

As you see, this demo site shows nowloading on the left top corner of the browser.  If you want to do the things like that, just add the code to the event handler `everyfetchstart` and `everyfetchend`.

jQuery.LazyJaxDavis provides only the apis to do things like this. To know more, keep reading the other pages in this document.

{% include nolazytestnav.html %}

