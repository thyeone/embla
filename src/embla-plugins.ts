import AutoHeight from 'embla-carousel-auto-height';
import AutoScroll from 'embla-carousel-auto-scroll';
import Autoplay from 'embla-carousel-autoplay';
import type { CarouselProps } from './EmblaCarousel';

type PluginConfig = Pick<
  CarouselProps,
  'isAutoScroll' | 'isAutoPlay' | 'isAutoHeight' | 'scrollOptions' | 'autoplayOptions'
>;

/**
 * Embla Carousel 플러그인들을 구성하는 유틸리티 함수
 */
export const plugins = ({ isAutoScroll, isAutoPlay, isAutoHeight, scrollOptions, autoplayOptions }: PluginConfig) => {
  if (isAutoScroll) {
    return [
      AutoScroll({
        playOnInit: true,
        stopOnInteraction: false,
        speed: 1,
        ...scrollOptions,
      }),
    ];
  }

  if (isAutoPlay) {
    return [
      Autoplay({
        playOnInit: true,
        stopOnInteraction: false,
        ...autoplayOptions,
      }),
    ];
  }

  if (isAutoHeight) {
    return [AutoHeight()];
  }

  return [];
};
