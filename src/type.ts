import type { EmblaOptionsType } from 'embla-carousel';
import type { AutoScrollOptionsType } from 'embla-carousel-auto-scroll';
import type { AutoplayOptionsType } from 'embla-carousel-autoplay';
import useEmblaCarousel from 'embla-carousel-react';

export type EmblaContextValue = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  onPrev: VoidFunction;
  onNext: VoidFunction;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  currentIndex: number;
  setCurrentIndex: React.Dispatch<React.SetStateAction<number>>;
  scrollTo: (index: number) => void;
} & Pick<CarouselProps, 'direction'>;

export type CustomEmblaOptionsType = EmblaOptionsType & {
  stopPropagation?: boolean;
};

export type CarouselProps = React.ComponentPropsWithoutRef<'div'> & {
  /**
   * 옵션을 설정합니다.
   */
  options?: CustomEmblaOptionsType;
  /**
   * 무한 롤링, AutoScroll에 사용되는 옵션을 설정합니다.
   */
  scrollOptions?: AutoScrollOptionsType;
  autoplayOptions?: AutoplayOptionsType;
  /**
   * 무한 롤링 여부를 설정합니다. (default:false)
   */
  isAutoScroll?: boolean;
  /**
   * AutoPlay를 설정합니다. (defualt:false)
   */
  isAutoPlay?: boolean;
  /**
   * AutoHeight 설정합니다. (defualt:false)
   */
  isAutoHeight?: boolean;
  /**
   * 스크롤 방향을 설정합니다. (default: horizontal)
   */
  direction?: 'horizontal' | 'vertical';
  /**
   * 스크롤 스냅 중일 때도 현재 인덱스를 tracking 합니다. (default: false)
   *
   */
  enableScrollIndexTracking?: boolean;

  enableKeyboardEvent?: boolean;
};
