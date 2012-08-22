import sbt._
import Keys._
import com.github.siasia.WarPlugin.warSettings

object ProjectBuild extends Build {
  lazy val root = Project(
    id = "root",
    base = new File("."),
    settings = Project.defaultSettings ++ warSettings ++ Seq(
      externalIvySettings(),
      externalIvyFile(),
      classpathConfiguration in Compile := config("compileWithProvided")))
}      
