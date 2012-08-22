import sbt._
import Keys._
import com.github.siasia.WarPlugin.warSettings

object ProjectBuild extends Build {
  lazy val root = Project(
    id = "root",
    base = new File("."),
    settings = Project.defaultSettings ++ warSettings ++ mySettings ++ Seq(
      externalIvySettings(),
      externalIvyFile(),
      classpathConfiguration in Compile := config("compileWithProvided")))

  object MyKeys {
    lazy val jdkHomePath = SettingKey[File]("jdk-home")
    lazy val jdkAptPath = SettingKey[File]("jdk-apt")
    lazy val slim3gen = TaskKey[Unit]("slim3gen", "Slim3 APT generation")
  }

  lazy val mySettings = Seq(
    MyKeys.jdkHomePath := {
      val dir = new File(System.getProperty("java.home"))
      dir.getName() match {
        // remove trailing jre if needed
        case s if s.endsWith("jre") => dir.getParentFile()
        case _ => dir
      }
    },
    MyKeys.jdkAptPath <<= MyKeys.jdkHomePath(_ / "bin" / "apt"),
    MyKeys.slim3gen <<= (MyKeys.jdkAptPath) map { (apt) =>
      val out = new StringBuffer
      // TODO: fix arguments
      val exit = Seq(apt.absolutePath)!

      println(out)
      println(exit)
    })
}      
