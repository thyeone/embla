import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType, EmblaOptionsType } from 'embla-carousel';
import AutoScroll, { type AutoScrollOptionsType } from 'embla-carousel-auto-scroll';
import Autoplay, { type AutoplayOptionsType } from 'embla-carousel-autoplay';
import AutoHeight from 'embla-carousel-auto-height';
import { cn } from './cn';

type EmblaContextValue = {
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

type CarouselProps = {
  /**
   * 옵션을 설정합니다.
   */
  options?: EmblaOptionsType;
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
};

const EmblaContext = createContext<EmblaContextValue | null>(null);

export default function EmblaCarousel({
  options,
  scrollOptions,
  autoplayOptions,
  direction = 'horizontal',
  isAutoScroll,
  isAutoPlay,
  isAutoHeight,
  enableScrollIndexTracking,
  children,
  className,
  ...rest
}: PropsWithStrictChildren & CarouselProps & React.ComponentPropsWithoutRef<'div'>) {
  const plugins = () => {
    if (isAutoScroll)
      return [
        AutoScroll({
          playOnInit: true,
          stopOnInteraction: false,
          speed: 1,
          ...scrollOptions,
        }),
      ];

    if (isAutoPlay)
      return [
        Autoplay({
          playOnInit: true,
          stopOnInteraction: false,
          ...autoplayOptions,
        }),
      ];

    if (isAutoHeight) return [AutoHeight()];
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...options,
      axis: direction === 'horizontal' ? 'x' : 'y',
    },
    plugins()
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onSelect = useCallback((api: EmblaCarouselType) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
    setCurrentIndex(api.selectedScrollSnap());

    if (api.selectedScrollSnap() !== currentIndex) {
      setCurrentIndex(api.selectedScrollSnap());
    }
  }, []);

  const onScroll = useCallback((api: EmblaCarouselType) => {
    const scrollProgress = api.scrollProgress();

    const snapList = api.scrollSnapList();

    if (snapList.length < 2) {
      return 0;
    }

    const snapTerm = snapList[1] - snapList[0];

    let closestIndex = 0;

    for (let i = 0; i < snapList.length; i++) {
      const lowRange = snapList[i] - snapTerm / 2;
      const highRange = snapList[i] + snapTerm / 2;

      if (lowRange < Math.ceil(scrollProgress) && scrollProgress <= highRange) {
        closestIndex = i;
        break;
      }
    }

    setCurrentIndex(closestIndex);
  }, []);

  const onPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const onNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrev();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    },
    [onPrev, onNext]
  );

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index, true);
        setCurrentIndex(index);
      }
    },
    [emblaApi]
  );
  useEffect(() => {
    if (!emblaApi) return;

    // onScroll, onSelect 이벤트 둘 다 사용하면 다음 버튼 연타했을 때 버벅거림이 있음
    if (isAutoScroll || enableScrollIndexTracking) {
      emblaApi.on('scroll', onScroll);
    }

    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi, onScroll, onSelect]);

  return (
    <EmblaContext.Provider
      value={{
        emblaRef,
        emblaApi,
        onPrev,
        onNext,
        canScrollPrev,
        canScrollNext,
        currentIndex,
        setCurrentIndex,
        direction,
        scrollTo,
      }}
    >
      <div onKeyDownCapture={handleKeyDown} className={cn('relative overflow-hidden', className)} {...rest}>
        {children}
      </div>
    </EmblaContext.Provider>
  );
}

type ContentProps = {
  cursorGrab?: boolean;
};

const Content = ({ className, cursorGrab = true, ...rest }: React.ComponentProps<'div'> & ContentProps) => {
  const { emblaRef, direction } = useEmbla();

  return (
    <div
      ref={emblaRef}
      className={cn('w-full cursor-default select-none overflow-hidden', {
        'cursor-grab active:cursor-grabbing lg:cursor-pointer': cursorGrab,
      })}
    >
      <div
        className={cn(
          'flex',
          {
            'flex-col': direction === 'vertical',
          },
          className
        )}
        {...rest}
      />
    </div>
  );
};

const Item = ({ children, className, ...rest }: PropsWithStrictChildren<React.ComponentProps<'div'>>) => {
  return (
    <div className={cn('min-w-0 shrink-0 grow-0', className)} {...rest}>
      {children}
    </div>
  );
};

EmblaCarousel.Content = Content;
EmblaCarousel.Item = Item;

const useEmbla = () => {
  const context = useContext(EmblaContext);

  if (!context) throw new Error('부모 트리에서 EmblaContext를 사용해주세요.');

  return { ...context };
};

export { useEmbla };
