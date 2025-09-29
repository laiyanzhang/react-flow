import SlideLeft from '@/components/SlideLeft';
import { ResizablePanel, ResizablePanelGroup } from '../lib/resizable';
import TopMenu from '../components/TopMenu';
import RobotComp from '@/components/robot/index';

export function Robot() {
  return (
    <div className='flex h-screen'>
      <SlideLeft />
      <div className='flex flex-col h-screen flex-1'>
        <ResizablePanelGroup
          direction='horizontal'
          className='w-screen h-screen'
        >
          <ResizablePanel className='relative'>
            <TopMenu />
            <RobotComp />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
