# ScalaJS + reveal.js = &#10084;
This is a basic project setup to create beautiful [reveal.js](https://github.com/hakimel/reveal.js/) presentations with [ScalaJS](https://www.scala-js.org/). To use it just clone this repository and simply start to write down your own slide-deck.

### How to use it
 1. Create a new SBT sub-project for your presentation (see [my-talk](https://github.com/pheymann/scala-reveal-js/blob/master/build.sbt#L30) as an example).
 2. Write down your slide-deck. For more information take a look at the [example](https://github.com/pheymann/scala-reveal-js/blob/master/my-talk/src/main/scala/MyTalk.scala) and [reveal.js](https://github.com/hakimel/reveal.js/).
 3. Compile your presentations with `sbt "project myTalk" "fastOptJS"` or if it is the final state `sbt "project myTalk fullOptJS"`. Just make sure you reference the right JS files in the [index.html](https://github.com/pheymann/scala-reveal-js/blob/master/my-talk/index.html) - the root of your presentation.
 
### Make it available to anybody
Best thing is, you can commit your compiled presentation and build a [Github page](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#enabling-github-pages-to-publish-your-site-from-master-or-gh-pages) from it. Now you can share knowledge easily.

See the [presentation]() build with this repository.
