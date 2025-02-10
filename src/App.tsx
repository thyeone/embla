import { EmblaCarousel } from './EmblaCarousel';

const ITEM_LIST = ['213', '23132', '213aaa', '23131zz', '2132423???', 'dafggggg'];

function App() {
  return (
    <main className='flex items-center justify-center w-screen h-dvh'>
      <div className='w-full max-w-6xl mx-auto'>
        <EmblaCarousel.Root
          options={{
            loop: true,
          }}
          isAutoScroll
        >
          <EmblaCarousel.Content className='h-[200px] gap-6'>
            {[...ITEM_LIST, ...ITEM_LIST].map((item, index) => (
              <EmblaCarousel.Item
                key={index}
                className='w-[200px] last:mr-6 flex items-center justify-center h-full bg-slate-400 rounded-lg'
              >
                {item}
              </EmblaCarousel.Item>
            ))}
          </EmblaCarousel.Content>
        </EmblaCarousel.Root>
      </div>
    </main>
  );
}

export default App;
