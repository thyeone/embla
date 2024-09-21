import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import type { EmblaCarouselType, EmblaOptionsType, EmblaPluginType } from 'embla-carousel';
import { cn } from './cn';
import AutoScroll, { type AutoScrollOptionsType } from 'embla-carousel-auto-scroll';

type EmblaContextValue = {
  emblaRef: ReturnType<typeof useEmblaCarousel>[0];
  emblaApi: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: VoidFunction;
  scrollNext: VoidFunction;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  currentIndex: number;
} & Pick<CarouselProps, 'direction'>;

type CarouselProps = {
  options?: EmblaOptionsType;
  scrollOptions?: AutoScrollOptionsType;
  plugins?: EmblaPluginType[];
  direction?: 'horizontal' | 'vertical';
  isAutoScroll?: boolean;
};

const EmblaContext = createContext<EmblaContextValue | null>(null);

export default function EmblaCarousel({
  options,
  scrollOptions,
  plugins,
  direction = 'horizontal',
  isAutoScroll,
  children,
  className,
  ...rest
}: PropsWithStrictChildren & CarouselProps & React.ComponentPropsWithoutRef<'div'>) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...options,
      axis: direction === 'horizontal' ? 'x' : 'y',
    },
    isAutoScroll
      ? [
          AutoScroll({
            playOnInit: true,
            stopOnInteraction: false,
            ...scrollOptions,
          }),
        ]
      : plugins
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
  }, []);

  const onScroll = useCallback((api: EmblaCarouselType) => {
    const scrollProgress = api.scrollProgress();
    const slideCount = api.scrollSnapList().length;
    const currentSlideIndex = Math.round(scrollProgress * (slideCount - 1));
    setCurrentIndex(currentSlideIndex);
  }, []);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        scrollPrev();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  useEffect(() => {
    if (!emblaApi) {
      return;
    }

    emblaApi.on('select', onSelect);
    emblaApi.on('scroll', onScroll);

    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('scroll', onScroll);
    };
  }, [emblaApi, onSelect, onScroll]);

  return (
    <EmblaContext.Provider
      value={{
        emblaRef,
        emblaApi,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        currentIndex,
        direction,
      }}
    >
      <div onKeyDownCapture={handleKeyDown} className={cn('relative', className)} {...rest}>
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
        'cursor-grab active:cursor-grabbing': cursorGrab,
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

const Item = ({ children, className, ...rest }: PropsWithChildren<React.ComponentProps<'div'>>) => {
  return (
    <div className={cn('min-w-0 shrink-0 grow-0', className)} {...rest}>
      {children}
    </div>
  );
};

EmblaCarousel.Content = Content;
EmblaCarousel.Item = Item;

export const useEmbla = () => {
  const context = useContext(EmblaContext);

  if (!context) throw new Error('부모 트리에서 EmblaContext를 사용해주세요.');

  return { ...context };
};
