import { Composition } from "remotion";
import { MyComposition } from "./Composition";
import timeline from "./timeline.json";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="Coliseu" component={MyComposition} durationInFrames={timeline.total} fps={timeline.fps} width={1080} height={1920} />
  );
};
