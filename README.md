## Usage

```tsx
import { EmblaCarousel } from './EmblaCarousel';

const LIST_LENGTH = 10;

export default function App() {
  return (
    <div>
      <EmblaCarousel.Root>
        <EmblaCarousel.Content>
          {Array.from({ length: LIST_LENGTH }).map((_, index) => (
            <Carousel key={index} />
          ))}
        </EmblaCarousel.Content>
      </EmblaCarousel.Root>
    </div>
  );
}

function Carousel() {
  const { currentIndex } = useEmbla();

  return <EmblaCarousel.Item>{currentIndex}</EmblaCarousel.Item>;
}
```
