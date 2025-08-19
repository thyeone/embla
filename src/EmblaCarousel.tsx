import type { EmblaCarouselType, EmblaOptionsType } from "embla-carousel";
import AutoHeight from "embla-carousel-auto-height";
import AutoScroll, {
  type AutoScrollOptionsType,
} from "embla-carousel-auto-scroll";
import Autoplay, { type AutoplayOptionsType } from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { cn } from "./cn";
import { createSafeContext } from "./create-safe-context";

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
} & Pick<CarouselProps, "direction">;

type CustomEmblaOptionsType = EmblaOptionsType & {
  stopPropagation?: boolean;
};

type CarouselProps = React.ComponentPropsWithoutRef<"div"> & {
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
  direction?: "horizontal" | "vertical";
  /**
   * 스크롤 스냅 중일 때도 현재 인덱스를 tracking 합니다. (default: false)
   *
   */
  enableScrollIndexTracking?: boolean;

  enableKeyboardEvent?: boolean;
};

const [EmblaProvider, useEmbla] =
  createSafeContext<EmblaContextValue>("EmblaContext");

export { useEmbla };

const Root = ({
  options: injectedOptions,
  scrollOptions,
  autoplayOptions,
  direction = "horizontal",
  isAutoScroll,
  isAutoPlay,
  isAutoHeight,
  enableScrollIndexTracking,
  enableKeyboardEvent,
  className,
  ...rest
}: PropsWithStrictChildren<CarouselProps>) => {
  const plugins = useMemo(() => {
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
  }, [isAutoHeight, isAutoPlay, isAutoScroll, autoplayOptions, scrollOptions]);

  const options = useMemo(() => {
    if (injectedOptions?.stopPropagation) {
      return {
        ...injectedOptions,
        watchDrag: (
          emblaApi: EmblaCarouselType,
          e: MouseEvent | TouchEvent
        ): boolean | undefined => {
          const target = e.target as HTMLElement | null;

          if (!target) return false;

          const currentRootNode = emblaApi.rootNode();

          const nearestViewportRoot = target.closest(
            ".embla-viewport"
          ) as HTMLElement | null;

          if (
            nearestViewportRoot &&
            currentRootNode &&
            nearestViewportRoot !== currentRootNode
          ) {
            return false;
          }

          return true;
        },
      };
    }

    return { ...injectedOptions };
  }, [injectedOptions]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      ...options,
      axis: direction === "horizontal" ? "x" : "y",
    },
    plugins
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
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        onPrev();
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
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
      emblaApi.on("scroll", onScroll);

      return () => {
        emblaApi.off("scroll", onScroll);
      };
    } else {
      emblaApi.on("select", onSelect);
      return () => {
        emblaApi.off("select", onSelect);
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
        className={cn("relative overflow-hidden outline-none", className)}
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
}: React.ComponentProps<"div"> & ContentProps) => {
  const { emblaRef, direction } = useEmbla();

  return (
    <div
      ref={emblaRef}
      className={cn(
        "embla-viewport w-full cursor-default select-none overflow-hidden",
        {
          "cursor-grab active:cursor-grabbing lg:cursor-pointer": cursorGrab,
        },
        wrapperClassName
      )}
    >
      <div
        className={cn(
          "flex",
          {
            "flex-col": direction === "vertical",
          },
          className
        )}
        {...rest}
      />
    </div>
  );
};

const Item = ({
  className,
  ...rest
}: PropsWithStrictChildren<React.ComponentProps<"div">>) => {
  return <div className={cn("min-w-0 shrink-0 grow-0", className)} {...rest} />;
};

export const EmblaCarousel = {
  Root,
  Content,
  Item,
};
