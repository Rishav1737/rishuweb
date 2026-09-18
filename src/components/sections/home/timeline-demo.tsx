import React from "react";
import { Timeline } from "@/components/ui/timeline";
import { FeatureCard } from "./features";
import PhraseAnimation from "@/components/common/phrase-reveal";

export function TimelineDemo() {
  const data = [
    {
      title: "SaaS Motion Graphics",
      content: (
        <div>
          <h3 className="text-xs font-normal text-neutral-800 md:text-3xl dark:text-neutral-200">
            <PhraseAnimation phrase="SAAS Animations of mine" />
          </h3>

          <p className="mb-8 mt-1.5 text-xs text-muted-foreground md:text-lg">
            <PhraseAnimation phrase="Tried to create motions you know!" />
          </p>

          <div className="mx-auto grid gap-4 lg:grid-cols-2">
            {/* Video 1 */}
            <FeatureCard className="w-full overflow-hidden p-0">
              <iframe
                src="https://www.youtube.com/embed/VUT6HhqKkBA"
                loading="lazy"
                title="SaaS Motion Graphics Video 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="block aspect-video w-full"
              />
            </FeatureCard>

            {/* Video 2 */}
            <FeatureCard className="w-full overflow-hidden p-0">
              <iframe
                src="https://www.youtube.com/embed/Uj_PtV-8D1Y"
                loading="lazy"
                title="SaaS Motion Graphics Video 2"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="block aspect-video w-full"
              />
            </FeatureCard>
          </div>
        </div>
      ),
    },

    {
      title: "Video Editing",
      content: (
        <div>
          <h3 className="text-xs font-normal text-neutral-800 md:text-3xl dark:text-neutral-200">
            <PhraseAnimation phrase="Transformation!" />
          </h3>

          <p className="mb-8 mt-1.5 text-xs text-muted-foreground md:text-lg">
            <PhraseAnimation phrase="Transformin' raw , boring videos to amazin' attractive vidoes!" />
          </p>

          <div className="mx-auto grid gap-4 lg:grid-cols-2">
            {/* Video 1 */}
            <FeatureCard className="w-full overflow-hidden p-0">
              <iframe
                src="https://www.youtube.com/embed/aa8hBDh7Hts?start=23"
                loading="lazy"
                title="Video Editing Showcase 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="block aspect-video w-full"
              />
            </FeatureCard>

            {/* Video 2 */}
            <FeatureCard className="w-full overflow-hidden p-0">
              <iframe
                src="https://www.youtube.com/embed/qiJ_qSvjkxo"
                loading="lazy"
                title="Video Editing Showcase 2"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="block aspect-video w-full"
              />
            </FeatureCard>

            {/* Video 3 */}
            <FeatureCard className="w-full overflow-hidden p-0 lg:col-span-2">
              <iframe
                src="https://www.youtube.com/embed/4ZHEV_Hkln8"
                loading="lazy"
                title="Video Editing Showcase 3"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="block aspect-video w-full"
              />
            </FeatureCard>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="relative mt-10 w-full overflow-clip">
      <Timeline data={data} />
    </div>
  );
}