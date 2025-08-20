import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import type { CustomEmblaOptionsType } from './type';

/**
 * Embla Carousel 옵션을 구성하는 유틸리티 함수
 */
export const options = (injectedOptions?: CustomEmblaOptionsType): EmblaOptionsType => {
  if (injectedOptions?.stopPropagation) {
    return {
      ...injectedOptions,
      watchDrag: (emblaApi: EmblaCarouselType, e: MouseEvent | TouchEvent): boolean | undefined => {
        const target = e.target as HTMLElement | null;

        if (!target) return false;

        const currentRootNode = emblaApi.rootNode();

        const nearestViewportRoot = target.closest('.embla-viewport') as HTMLElement | null;

        if (nearestViewportRoot && currentRootNode && nearestViewportRoot !== currentRootNode) {
          return false;
        }

        return true;
      },
    };
  }

  return { ...injectedOptions };
};
