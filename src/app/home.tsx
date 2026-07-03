import { Redirect, type Href } from "expo-router";

export default function HomePlaceholderScreen() {
  return <Redirect href={"/user" as Href} />;
}
