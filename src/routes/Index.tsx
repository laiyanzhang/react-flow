import { ResizablePanel, ResizablePanelGroup } from '../lib/resizable';
import Dashboard from '@/components/dashboard/index';

export function Index() {
  return (
    <div className='flex h-screen'>
      {/* <SlideLeft /> */}
      <div className='flex flex-col h-screen flex-1'>
        <ResizablePanelGroup
          direction='horizontal'
          className='w-screen h-screen'
        >
          <ResizablePanel className='relative'>
            {/* <TopMenu /> */}
            <div className='flex-1 flex-grow bg-accent/50 w-full h-full overflow-auto'>
              <Dashboard />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
