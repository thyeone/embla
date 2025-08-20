import type { EmblaCarouselType } from 'embla-carousel';
import useEmblaCarousel from 'embla-carousel-react';
import { useCallback, useEffect, useState } from 'react';
import { cn } from './cn';
import { createSafeContext } from './create-safe-context';
import { options } from './embla-options';
import { plugins } from './embla-plugins';
import { CarouselProps, EmblaContextValue } from './type';

const [EmblaProvider, useEmbla] = createSafeContext<EmblaContextValue>('EmblaContext');

export { useEmbla };

const Root = ({
  options: injectedOptions,
  scrollOptions,
  autoplayOptions,
  direction = 'horizontal',
  isAutoScroll,
  isAutoPlay,
  isAutoHeight,
  enableScrollIndexTracking,
  enableKeyboardEvent,
  className,
  ...rest
}: PropsWithStrictChildren<CarouselProps>) => {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...options(injectedOptions),
      axis: direction === 'horizontal' ? 'x' : 'y',
    },
    plugins({ isAutoScroll, isAutoPlay, isAutoHeight, scrollOptions, autoplayOptions })
  );
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const callbackRef = (node: HTMLDivElement | null) => {
    if (node) {
      node.focus();
    }
  };

  const onSelect = useCallback(
    (api: EmblaCarouselType) => {
      if (!api) {
        return;
      }

      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
      setCurrentIndex(api.selectedScrollSnap());

      if (api.selectedScrollSnap() !== currentIndex) {
        setCurrentIndex(api.selectedScrollSnap());
      }
    },
    [currentIndex]
  );

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
    if (!emblaApi) return;

    if (emblaApi.canScrollPrev()) {
      emblaApi?.scrollPrev();
      setCurrentIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  const onNext = useCallback(() => {
    if (!emblaApi) return;

    if (emblaApi.canScrollNext()) {
      emblaApi?.scrollNext();
      setCurrentIndex(emblaApi.selectedScrollSnap());
    }
  }, [emblaApi]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
        event.preventDefault();
        onPrev();
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
        event.preventDefault();
        onNext();
      }
    },
    [onPrev, onNext]
  );

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
        setCurrentIndex(index);
      }
    },
    [emblaApi]
  );
  useEffect(() => {
    if (!emblaApi) return;

    if (enableScrollIndexTracking || isAutoScroll) {
      emblaApi.on('scroll', onScroll);

      return () => {
        emblaApi.off('scroll', onScroll);
      };
    } else {
      emblaApi.on('select', onSelect);
      return () => {
        emblaApi.off('select', onSelect);
      };
    }
  }, [emblaApi, onScroll, onSelect, enableScrollIndexTracking, isAutoScroll]);

  return (
    <EmblaProvider
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
      <div
        {...(enableKeyboardEvent && {
          ref: callbackRef,
          onKeyDown: handleKeyDown,
          tabIndex: 0,
        })}
        className={cn('overflow-hidden relative outline-none', className)}
        {...rest}
      />
    </EmblaProvider>
  );
};

type ContentProps = {
  cursorGrab?: boolean;
  wrapperClassName?: string;
};

const Content = ({
  className,
  cursorGrab = true,
  wrapperClassName,
  ...rest
}: React.ComponentProps<'div'> & ContentProps) => {
  const { emblaRef, direction } = useEmbla();

  return (
    <div
      ref={emblaRef}
      className={cn(
        'overflow-hidden w-full cursor-default select-none embla-viewport',
        {
          'cursor-grab active:cursor-grabbing lg:cursor-pointer': cursorGrab,
        },
        wrapperClassName
      )}
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

const Item = ({ className, ...rest }: PropsWithStrictChildren<React.ComponentProps<'div'>>) => {
  return <div className={cn('min-w-0 shrink-0 grow-0', className)} {...rest} />;
};

export const EmblaCarousel = {
  Root,
  Content,
  Item,
};
