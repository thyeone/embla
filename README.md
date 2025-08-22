# embla-kit

```bash
npm install @thyeone/embla
```

## Usage

```tsx
import { EmblaCarousel } from '@thyeone/embla';

const LIST_LENGTH = 10;

export default function App() {
  return (
    <EmblaCarousel.Root>
      <EmblaCarousel.Content>
        {Array.from({ length: LIST_LENGTH }).map((_, index) => (
          <Carousel key={index} />
        ))}
      </EmblaCarousel.Content>
    </EmblaCarousel.Root>
  );
}

function Carousel() {
  const { currentIndex } = useEmbla();

  return <EmblaCarousel.Item>{currentIndex}</EmblaCarousel.Item>;
}
```

## Interface

``` tsx
export declare const EmblaCarousel: {
    Root: ({ options: injectedOptions, scrollOptions, autoplayOptions, direction, isAutoScroll, isAutoPlay, isAutoHeight, enableScrollIndexTracking, enableKeyboardEvent, className, ...rest }: CarouselProps) => JSX.Element;
    Content: ({ className, cursorGrab, wrapperClassName, ...rest }: React.ComponentProps<"div"> & ContentProps) => JSX.Element;
    Item: ({ className, ...rest }: React.ComponentProps<"div">) => JSX.Element;
};
```

## Nested Carousel (prevent propagation)

``` tsx
export default function Index() {
  return (
    <EmblaCarousel.Root
      options={{
        stopPropagation: true,
      }}
    >
      <EmblaCarousel.Content>
        <EmblaCarousel.Root
          options={{
            stopPropagation: true,
          }}
        >
          <EmblaCarousel.Content>
            <EmblaCarousel.Item className="size-[300px] border border-gray-100 rounded-md"></EmblaCarousel.Item>
          </EmblaCarousel.Content>
        </EmblaCarousel.Root>
      </EmblaCarousel.Content>
    </EmblaCarousel.Root>
  );
}

```
