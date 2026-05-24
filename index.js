// Monorepo entry for Android release bundles (Gradle/Metro resolve from repo root).
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import App from "./apps/mobile/App";

registerRootComponent(App);
