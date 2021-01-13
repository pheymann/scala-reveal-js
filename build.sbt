ThisBuild / scalaVersion := "2.13.4"

lazy val common = Seq(
  version      := "-",
  libraryDependencies ++= Seq(
    "com.github.japgolly.scalajs-react" %%% "core" % "1.5.0",
    "org.scala-js" %%% "scalajs-dom" % "1.1.0"
  ),
  jsDependencies ++= Seq(
    "org.webjars.bower" % "react" % "15.2.1" / "react-with-addons.js" minified "react-with-addons.min.js" commonJSName "React",
    "org.webjars.bower" % "react" % "15.2.1" / "react-dom.js"         minified "react-dom.min.js" dependsOn "react-with-addons.js" commonJSName "ReactDOM"
  ),

  scalaJSUseMainModuleInitializer := true
)

lazy val root = project
  .in(file("."))
  .aggregate(
    myTalk,
    shared
  )

lazy val shared = project
  .in(file("shared"))
  .enablePlugins(ScalaJSPlugin)
  .settings(common)

lazy val myTalk = project
  .in(file("my-talk"))
  .enablePlugins(ScalaJSPlugin)
  .settings(common)
  .dependsOn(shared)
